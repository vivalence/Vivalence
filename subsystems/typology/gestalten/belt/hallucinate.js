import { NotFound, ToolCall, Vector, fromm, soma, steer, verbatim } from "@vivalence/typology";
import * as entities from "../../schematics/entities/index.js";

export const signalOf = (name) => new ToolCall(name).signal;
export const nameOf = (steps) => new ToolCall(steps).name;

// what the model HEARS of a tool's yield: the message, then every entity row the client also
// receives, spoken as data. a descriptor's `spoken` names the paths a row speaks — the bulk a
// tool can fetch on demand (a view's bundle, a buffer's payload) stays off the wire. a related
// row speaks as its id.
const descriptors = Object.values(entities).filter((entry) => entry?.own && typeof entry.$id === "string");
const spoken = (key) =>
  descriptors.find((entry) => entry.$id.toLowerCase() === key)?.spoken ?? null;
const at = (row, path) =>
  path.split(".").reduce((value, step) => (value == null ? value : value[step]), row);
const card = (row, paths) => {
  if (!paths || row == null || typeof row !== "object") return row;
  const out = {};
  for (const path of paths) {
    const value = at(row, path);
    if (value === undefined) continue;
    const key = path.split(".")[0];
    const plain = value !== null && typeof value === "object" && !Array.isArray(value) && "id" in value
      ? value.id
      : value;
    if (path.includes(".")) (out[key] ??= {})[path.slice(key.length + 1)] = plain;
    else out[key] = plain;
  }
  return out;
};
export const speak = (output) => {
  if (output == null) return "";
  if (typeof output !== "object") return String(output);
  const { message, ...rest } = output;
  const rows = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map((row) => card(row, spoken(key))) : value,
    ]),
  );
  return [message, Object.keys(rows).length ? JSON.stringify(rows) : null]
    .filter((line) => line != null && line !== "")
    .join("\n");
};

const armory = (tools) =>
  steer.trie
    .rollup(tools, () => null)
    .map((entry) => nameOf(entry.steps))
    .join(", ");

export const state = (turn) =>
  turn.parts.some((part) => part.type === "tool_use") ? "tools" : (turn.meta?.state ?? "complete");

export async function* deliver(pump, backoff, span, signal) {
  let retried = 0;
  while (true) {
    let flowing = false;
    try {
      const packets = await pump(signal);
      for await (const packet of packets) {
        flowing = true;
        yield packet;
      }
      return;
    } catch (fault) {
      const delay = backoff[retried];
      if (flowing || !fault.retryable || delay === undefined || signal?.aborted) throw fault;
      retried += 1;
      span.note({ retry: retried, delay, message: fault.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function settle({ tools, controller }, call) {
  const child = controller.branch(call.name);
  const armed = new Vector().use(async (ctx, next) => { ctx.controller = child; await next(); }).slurp(tools);
  const cut = new Promise((_, reject) =>
    child.abort.signal.addEventListener("abort", () => reject(child.status.reflection.error ?? new Error(String(child.abort.signal.reason))), { once: true }),
  );
  child.stdout.mark("open", { input: call.input });
  try {
    const spoken = fromm.yield(
      await Promise.race([
        steer.dispatch.invoke(armed, new ToolCall(call.name).signal, steer.strategy.guarded)(call.input),
        cut,
      ]),
    );
    child.stdout.mark("close", { condition: spoken.condition });
    return { call, result: { condition: spoken.condition, output: spoken.output } };
  } catch (fault) {
    child.stdout.fault(fault);
    const message =
      fault instanceof NotFound
        ? `unknown tool: ${call.name} — armed: ${armory(tools) || "(none)"}`
        : fault.message;
    return { call, result: { condition: "ERROR", output: { message } } };
  }
}

// @beef serial: a round's calls share one em fork and a failed flush strands mikro's queued flushes — might in the future change to parallel
export async function dispatch(policy, parts) {
  const settled = [];
  for (const call of parts.filter((part) => part.type === "tool_use")) settled.push(await settle(policy, call));
  return settled;
}

const pump = {
  stream: (faculty, request, signal) => faculty.via.stream(request, { signal }),
  render: async (faculty, request, signal) => soma.drain(await faculty.via.render(request, { signal })),
};

export async function* respond(faculty, streamOrRender, request, policy) {
  const { controller } = policy;
  const span = controller.stdout;
  span.open();
  span.note({ streamOrRender, faculty: faculty.type });
  let turns = request.turns;
  let rounds = 0;
  try {
    while (rounds < policy.rounds) {
      if (!(await controller.proceed())) {
        yield { event: "/response/close", meta: { state: "abort", rounds } };
        return;
      }
      rounds += 1;
      let turn = null;
      for await (const packet of deliver(
        (signal) => pump[streamOrRender](faculty, { ...request, turns }, signal),
        policy.backoff,
        span,
        controller.abort.signal,
      )) {
        if (!(await controller.proceed())) {
          yield { event: "/response/close", meta: { state: "abort", rounds } };
          return;
        }
        turn = soma.pour(turn, packet);
        yield packet;
      }
      if (!(await controller.proceed())) {
        yield { event: "/response/close", meta: { state: "abort", rounds } };
        return;
      }
      const closed = turn ? state(turn) : "error";
      span.note({ round: rounds, state: closed, usage: turn?.meta?.usage });
      if (closed !== "tools") {
        yield { event: "/response/close", meta: { ...turn?.meta, state: closed, rounds } };
        return;
      }
      const settled = await dispatch(policy, turn.parts);
      const parts = [];
      for (const { call, result } of settled) {
        yield { event: "/tool/call", id: call.id, name: call.name, input: call.input };
        yield { event: "/tool/yield", id: call.id, result };
        parts.push({ type: "tool_result", id: call.id, condition: result.condition, output: result.output });
      }
      const answered = { role: "user", parts };
      yield { event: "/turn/full", turn: answered };
      turns = [...turns, turn, answered];
    }
    yield { event: "/response/close", meta: { state: "length", rounds } };
  } catch (fault) {
    if (controller.abort.signal.aborted) {
      yield { event: "/response/close", meta: { state: "abort", rounds } };
      return;
    }
    span.fault(fault);
    yield {
      event: "/response/close",
      meta: {
        state: "error",
        rounds,
        fault: {
          kind: fault.kind ?? "unknown",
          message: fault.provider?.message ?? fault.message ?? null,
        },
      },
    };
  } finally {
    span.close();
  }
}

export async function render(faculty, request, policy) {
  let folded = null;
  for await (const record of respond(faculty, "render", request, policy))
    folded = soma.transcript(folded, record);
  if (folded.meta.state !== "complete")
    throw new Error(
      `[hallucinate] '${faculty.type}' response closed ${folded.meta.state} after ${folded.meta.rounds} rounds` +
        (folded.meta.fault?.message ? ` — ${folded.meta.fault.message}` : ""),
    );
  return folded;
}

export async function* transcribe(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  span.open();
  span.note({ faculty: faculty.type, harmonize: policy.harmonize });
  try {
    yield* verbatim.harmonize(faculty.via.stream(source, settings), policy.harmonize);
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

export async function transcript(faculty, input, policy) {
  let state = verbatim.empty;
  for await (const event of transcribe(faculty, input, policy)) state = verbatim.fold(state, event);
  return verbatim.transcript(state);
}

export async function* synthesize(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  span.open();
  span.note({ faculty: faculty.type });
  try {
    yield* faculty.via.stream(source, settings);
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

export async function vocalize(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  span.open();
  span.note({ faculty: faculty.type });
  try {
    return await faculty.via.render(source, settings);
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

export async function choose(faculty, round, policy) {
  const span = policy.controller.stdout;
  span.open();
  span.note({ faculty: faculty.type, model: faculty.config?.model, questions: Object.fromEntries(Object.entries(round.questions).map(([key, question]) => [key, question.type])) });
  try {
    const verdict = await faculty.via.render(round, { signal: policy.controller.abort.signal });
    span.note({ verdict });
    return verdict;
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

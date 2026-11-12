import { v7 } from "uuid";
import { NotFound } from "../../prototypes/errors/vector.js";
import { Queue } from "../../prototypes/queue.js";
import { ToolCall } from "../../prototypes/toolcall.js";
import { Vector } from "../../prototypes/vector.js";
import * as fromm from "../fromm/index.js";
import * as object from "./object.js";
import * as soma from "./soma.js";
import * as steer from "../steer/index.js";
import * as verbatim from "./verbatim.js";
import * as entities from "../../schematics/entities/index.js";

export const signalOf = (name) => new ToolCall(name).signal;
export const nameOf = (steps) => new ToolCall(steps).name;

export const declarations = (tools) =>
  steer.trie.leaves(tools).map(({ pattern, steps }) => ({
    name: nameOf(steps),
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
    ...(pattern.output && { output: pattern.output }),
  }));

const declared = (request, tools) => {
  const catalog = declarations(tools);
  return catalog.length ? { ...request, tools: catalog } : request;
};

// what the model HEARS of a tool's yield: the message, then every entity row the client also
// receives, spoken as data. a descriptor's `spoken` names the paths a row speaks — the bulk a
// tool can fetch on demand (a view's bundle, a buffer's payload) stays off the wire. a related
// row speaks as its id.
let descriptors;
const spoken = (key) =>
  (descriptors ??= Object.values(entities).filter((entry) => entry?.own && typeof entry.$id === "string")).find((entry) => entry.$id.toLowerCase() === key)?.spoken ?? null;
const card = (row, paths) => {
  if (!paths || row == null || typeof row !== "object") return row;
  const out = {};
  for (const path of paths) {
    const value = object.at(row, path);
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
export const speak = (product) => {
  if (product == null) return "";
  if (typeof product !== "object") return String(product);
  const { message, ...rest } = product;
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
    .leaves(tools)
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
      span.log({ retry: retried, delay, message: fault.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function settle({ tools, controller }, call) {
  const child = controller.branch(`${call.name}/${call.id}`);
  const armed = new Vector().use(async (ctx, next) => { ctx.controller = child; await next(); }).graft(tools);
  const cut = new Promise((_, reject) =>
    child.abort.signal.addEventListener("abort", () => reject(child.status.reflection.error ?? new Error(String(child.abort.signal.reason))), { once: true }),
  );
  child.start().stdout.log({ input: call.input });
  try {
    const spoken = fromm.yield(
      await Promise.race([
        steer.dispatch.invoke(armed, new ToolCall(call.name), steer.strategy.guarded)(call.input),
        cut,
      ]),
    );
    child.stdout.log({ condition: spoken.condition });
    child.stop();
    return { call, result: { condition: spoken.condition, product: spoken.product } };
  } catch (fault) {
    child.fault(fault);
    const message =
      fault instanceof NotFound
        ? `unknown tool: ${call.name} — armed: ${armory(tools) || "(none)"}`
        : fault.message;
    return { call, result: { condition: "ERROR", product: { message } } };
  }
}

// @beef serial: a round's calls share one em fork and a failed flush strands mikro's queued flushes — might in the future change to parallel
export async function dispatch(policy, parts) {
  const settled = [];
  for (const call of parts.filter((part) => part.type === "tool_use")) settled.push(await settle(policy, call));
  return settled;
}

const answer = async (policy, turn) => ({
  role: "user",
  parts: (await dispatch(policy, turn.parts)).map(({ call, result }) => ({
    type: "tool_result",
    id: call.id,
    condition: result.condition,
    product: result.product,
  })),
});

const pump = {
  stream: (faculty, request, signal) => faculty.via.stream(request, { signal }),
  render: async (faculty, request, signal) => soma.drain(await faculty.via.render(request, { signal })),
};

export async function* respond(faculty, streamOrRender, request, policy) {
  const { controller } = policy;
  const span = controller.stdout;
  policy.controller.start();
  span.log({ streamOrRender, faculty: faculty.type });
  let turns = request.turns;
  let rounds = 0;
  try {
    while (rounds < policy.rounds) {
      if (!(await controller.proceed())) {
        yield { event: "/response/close", response: { meta: { state: "abort", rounds } } };
        return;
      }
      rounds += 1;
      let turn = null;
      for await (const packet of deliver(
        (signal) => pump[streamOrRender](faculty, { ...declared(request, policy.tools), turns }, signal),
        policy.backoff,
        span,
        controller.abort.signal,
      )) {
        if (!(await controller.proceed())) {
          yield { event: "/response/close", response: { meta: { state: "abort", rounds } } };
          return;
        }
        turn = soma.pour(turn, packet);
        yield packet;
      }
      if (!(await controller.proceed())) {
        yield { event: "/response/close", response: { meta: { state: "abort", rounds } } };
        return;
      }
      const closed = turn ? state(turn) : "error";
      span.log({ round: rounds, state: closed, usage: turn?.meta?.usage });
      if (closed !== "tools") {
        yield { event: "/response/close", response: { meta: { ...turn?.meta, state: closed, rounds } } };
        return;
      }
      const answered = await answer(policy, turn);
      yield { event: "/turn/full", turn: answered };
      turns = [...turns, turn, answered];
    }
    yield { event: "/response/close", response: { meta: { state: "length", rounds } } };
  } catch (fault) {
    if (controller.abort.signal.aborted) {
      yield { event: "/response/close", response: { meta: { state: "abort", rounds } } };
      return;
    }
    policy.controller.fault(fault);
    yield {
      event: "/response/close",
      response: {
        meta: {
          state: "error",
          rounds,
          fault: {
            kind: fault.kind ?? "unknown",
            message: fault.provider?.message ?? fault.message ?? null,
          },
        },
      },
    };
  } finally {
    policy.controller.stop();
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
  const { open, ...response } = folded;
  return response;
}

async function* stamped(packets) {
  for await (const packet of packets) {
    if (packet.event === "/turn/open") yield { ...packet, turn: { ...packet.turn, id: v7() } };
    else yield packet;
  }
}

export async function* transcribe(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type, harmonize: policy.harmonize });
  try {
    const heard = faculty.via.stream({ source, settings }, { signal: policy.controller.abort.signal });
    yield* stamped(verbatim.harmonize(heard, policy.harmonize));
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    policy.controller.stop();
  }
}

export async function transcript(faculty, input, policy) {
  let folded = null;
  for await (const packet of transcribe(faculty, input, policy)) folded = soma.transcript(folded, packet);
  return folded === null ? "" : soma.spoken(folded);
}

export async function* converse(faculty, { source, settings, ...request }, policy) {
  const span = policy.controller.stdout;
  const answers = new Queue();
  policy.controller.start();
  span.log({ faculty: faculty.type, id: faculty.id });
  const fed = (async function* () {
    try {
      yield* source;
    } finally {
      answers.close();
    }
  })();
  let turn = null;
  try {
    const heard = faculty.via.stream(
      { ...request, source: soma.merge(fed, answers.drain()), settings },
      { signal: policy.controller.abort.signal },
    );
    for await (const packet of stamped(heard)) {
      turn = soma.pour(turn, packet);
      yield packet;
      if (packet.event !== "/turn/close" || state(turn) !== "tools") continue;
      const answered = { event: "/turn/full", turn: await answer(policy, turn) };
      yield answered;
      answers.enqueue(answered);
    }
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    answers.close();
    policy.controller.stop();
  }
}

export async function* synthesize(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type });
  try {
    yield* faculty.via.stream({ source, settings }, { signal: policy.controller.abort.signal });
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    policy.controller.stop();
  }
}

export async function vocalize(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type });
  try {
    return await faculty.via.render({ source, settings }, { signal: policy.controller.abort.signal });
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    policy.controller.stop();
  }
}

export async function depict(faculty, request, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type, id: faculty.id, references: request.images.length, mask: request.mask !== undefined });
  try {
    const response = await faculty.via.render(request, { signal: policy.controller.abort.signal });
    return { ...response, provider: faculty.provider, id: faculty.id };
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    policy.controller.stop();
  }
}

export async function choose(faculty, round, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type, id: faculty.id, questions: Object.fromEntries(Object.entries(round.questions).map(([key, question]) => [key, question.type])) });
  try {
    const verdict = await faculty.via.render(round, { signal: policy.controller.abort.signal });
    span.log({ verdict });
    return verdict;
  } catch (fault) {
    policy.controller.fault(fault);
    throw fault;
  } finally {
    policy.controller.stop();
  }
}

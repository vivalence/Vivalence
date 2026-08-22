import { NotFound, Span, ToolCall, fromm, soma, steer, verbatim } from "@vivalence/typology";

export const signalOf = (name) => new ToolCall(name).signal;
export const nameOf = (steps) => new ToolCall(steps).name;

const armory = (tools) =>
  steer.trie
    .rollup(tools, () => null)
    .map((entry) => nameOf(entry.steps))
    .join(", ");

export const state = (turn) =>
  turn.parts.some((part) => part.type === "tool_use") ? "tools" : (turn.meta?.state ?? "complete");

export async function* deliver(pump, backoff, span) {
  let retried = 0;
  while (true) {
    let flowing = false;
    try {
      const packets = await pump();
      for await (const packet of packets) {
        flowing = true;
        yield packet;
      }
      return;
    } catch (fault) {
      span.fault(fault);
      const delay = backoff[retried];
      if (flowing || !fault.retryable || delay === undefined) throw fault;
      retried += 1;
      span.note({ retry: retried, delay });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function dispatch(tools, parts, span) {
  const calls = parts.filter((part) => part.type === "tool_use");
  return Promise.all(
    calls.map(async (call) => {
      const branch = span.branch(call.name);
      branch.mark("open", { input: call.input });
      try {
        const spoken = fromm.yield(
          await steer.dispatch.invoke(
            tools,
            new ToolCall(call.name).signal,
            steer.strategy.guarded,
          )(call.input),
        );
        branch.mark("close", { condition: spoken.condition });
        return { call, result: { condition: spoken.condition, output: spoken.output } };
      } catch (fault) {
        branch.fault(fault);
        const message =
          fault instanceof NotFound
            ? { error: `unknown tool: ${call.name} — armed: ${armory(tools) || "(none)"}` }
            : { error: fault.message };
        return { call, result: { condition: "ERROR", output: { message } } };
      }
    }),
  );
}

const pump = {
  stream: (faculty, request) => faculty.via.stream(request),
  render: async (faculty, request) => soma.drain(await faculty.via.render(request)),
};

export async function* respond(faculty, streamOrRender, request, policy) {
  const span = policy.span ?? new Span("/hallucination");
  span.open();
  span.note({ streamOrRender, faculty: faculty.type });
  let turns = request.turns;
  let rounds = 0;
  try {
    while (rounds < policy.rounds) {
      rounds += 1;
      let turn = null;
      for await (const packet of deliver(
        () => pump[streamOrRender](faculty, { ...request, turns }),
        policy.backoff,
        span,
      )) {
        turn = soma.pour(turn, packet);
        yield packet;
      }
      const closed = turn ? state(turn) : "error";
      span.note({ round: rounds, state: closed, usage: turn?.meta?.usage });
      if (closed !== "tools") {
        yield { event: "/response/close", meta: { ...turn?.meta, state: closed, rounds } };
        return;
      }
      const settled = await dispatch(policy.tools, turn.parts, span);
      const parts = [];
      for (const { call, result } of settled) {
        yield { event: "/tool/call", id: call.id, name: call.name, input: call.input };
        yield { event: "/tool/yield", id: call.id, result };
        parts.push({ type: "tool_result", id: call.id, output: result.output });
      }
      const answered = { role: "user", parts };
      yield { event: "/turn/full", turn: answered };
      turns = [...turns, turn, answered];
    }
    yield { event: "/response/close", meta: { state: "length", rounds } };
  } catch (fault) {
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
      `[hallucinate] '${faculty.type}' response closed ${folded.meta.state} after ${folded.meta.rounds} rounds`,
    );
  return folded;
}

export async function* transcribe(faculty, { source, config, harmonize }, policy = {}) {
  const span = policy.span ?? new Span("/hallucination");
  span.open();
  span.note({ faculty: faculty.type, harmonize });
  try {
    yield* verbatim.harmonize(faculty.via.stream(source, config), harmonize);
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

export async function* synthesize(faculty, { source, config }, policy = {}) {
  const span = policy.span ?? new Span("/hallucination");
  span.open();
  span.note({ faculty: faculty.type });
  try {
    yield* faculty.via.stream(source, config);
  } catch (fault) {
    span.fault(fault);
    throw fault;
  } finally {
    span.close();
  }
}

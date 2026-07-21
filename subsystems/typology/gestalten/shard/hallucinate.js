import { NotFound, Span, ToolCall, fromm, soma, steer } from "@vivalence/typology";

export const signalOf = (name) => new ToolCall(name).signal;
export const nameOf = (steps) => new ToolCall(steps).name;

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
        return {
          call,
          result: {
            condition: spoken.condition,
            message: spoken.message,
            entities: spoken.entities,
            object: spoken.object,
          },
        };
      } catch (fault) {
        branch.fault(fault);
        const message =
          fault instanceof NotFound
            ? { error: `unknown tool: ${call.name}` }
            : { error: fault.message };
        return { call, result: { condition: "ERROR", message, entities: {}, object: null } };
      }
    }),
  );
}

const pump = {
  stream: (faculty, request) => faculty.via.stream(request),
  render: async (faculty, request) => soma.drain(await faculty.via.render(request)),
};

export async function* session(faculty, streamOrRender, hallucinationRequest, requestConfig) {
  const span = requestConfig.span ?? new Span("/hallucination");
  span.open();
  span.note({ streamOrRender, faculty: faculty.type });
  let turns = hallucinationRequest.turns;
  let rounds = 0;
  try {
    while (rounds < requestConfig.rounds) {
      rounds += 1;
      let turn = null;
      for await (const packet of deliver(
        () => pump[streamOrRender](faculty, { ...hallucinationRequest, turns }),
        requestConfig.backoff,
        span,
      )) {
        turn = soma.pour(turn, packet);
        yield packet;
      }
      const closed = turn ? state(turn) : "error";
      span.note({ round: rounds, state: closed, usage: turn?.meta?.usage });
      if (closed !== "tools") {
        yield { event: "/session/close", state: closed, rounds, meta: turn?.meta };
        return;
      }
      const settled = await dispatch(requestConfig.tools, turn.parts, span);
      const parts = [];
      for (const { call, result } of settled) {
        yield { event: "/tool/call", id: call.id, name: call.name, input: call.input };
        yield { event: "/tool/yield", id: call.id, result };
        parts.push({
          type: "tool_result",
          id: call.id,
          output: result.message ?? result.object,
          entities: result.entities,
          object: result.object,
        });
      }
      const answered = { role: "user", parts };
      yield { event: "/turn/full", turn: answered };
      turns = [...turns, turn, answered];
    }
    yield { event: "/session/close", state: "length", rounds };
  } catch (fault) {
    span.fault(fault);
    yield {
      event: "/session/close",
      state: "error",
      rounds,
      meta: { fault: { kind: fault.kind ?? "unknown", message: fault.message ?? null } },
    };
  } finally {
    span.close();
  }
}

export async function render(faculty, request, policy) {
  let folded = null;
  for await (const record of session(faculty, "render", request, policy))
    folded = soma.transcript(folded, record);
  if (folded.state !== "complete")
    throw new Error(
      `[hallucinate] '${faculty.type}' session closed ${folded.state} after ${folded.rounds} rounds`,
    );
  return folded;
}

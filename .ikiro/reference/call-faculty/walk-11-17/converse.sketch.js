import { Queue } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/queue.js";
import { dispatch, state } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/hallucinate.js";
import * as soma from "./soma.copy.js";

export async function* locked(faculty, { source, settings, ...request }, policy) {
  const answers = new Queue();
  let turn = null;
  for await (const packet of faculty.via.stream({ ...request, source: soma.merge(source, answers.drain()), settings }, { signal: policy.controller.abort.signal })) {
    turn = soma.pour(turn, packet);
    yield packet;
    if (packet.event !== "/turn/close" || state(turn) !== "tools") continue;
    for (const { call, result } of await dispatch(policy, turn.parts)) {
      yield { event: "/tool/yield", id: call.id, result };
      answers.enqueue({ event: "/tool/yield", id: call.id, result });
    }
  }
}

export async function* converse(faculty, { source, settings, ...request }, policy) {
  const answers = new Queue();
  let turn = null;
  for await (const packet of faculty.via.stream({ ...request, source: soma.merge(source, answers.drain()), settings }, { signal: policy.controller.abort.signal })) {
    turn = soma.pour(turn, packet);
    yield packet;
    if (packet.event !== "/turn/close" || state(turn) !== "tools") continue;
    const parts = [];
    for (const { call, result } of await dispatch(policy, turn.parts)) {
      yield { event: "/tool/call", id: call.id, name: call.name, input: call.input };
      yield { event: "/tool/yield", id: call.id, result };
      parts.push({ type: "tool_result", id: call.id, condition: result.condition, output: result.output });
      answers.enqueue({ event: "/tool/yield", id: call.id, result });
    }
    yield { event: "/turn/full", turn: { role: "user", parts } };
  }
}

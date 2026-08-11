import { waiter } from "./promise.js";

export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
    case "/part/open":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "/part/delta": {
      const part = turn.parts[packet.index];
      for (const [key, value] of Object.entries(packet.delta)) {
        part[key] =
          typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
      }
      break;
    }
    case "/part/close": {
      const part = turn.parts[packet.index];
      if (part?.type === "tool_use" && typeof part.input === "string")
        part.input = part.input ? JSON.parse(part.input) : {};
      break;
    }
    case "/turn/close":
      turn.meta = packet.meta;
      break;
    case "/turn/full":
      return packet.turn;
  }
  return turn;
}

export function transcript(state, record) {
  const current = state ?? {
    open: null,
    condition: null,
    turns: [],
    output: {},
    meta: undefined,
  };
  switch (record.event) {
    case "/turn/open":
      return { ...current, open: pour(null, record) };
    case "/turn/close": {
      const sealed = pour(current.open, record);
      const next = { ...current, turns: [...current.turns, sealed], open: null };
      if (sealed.role === "assistant") {
        const text = sealed.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(" ");
        const data = sealed.object ?? sealed.parts.find((part) => part.type === "object")?.data;
        if (text || data !== undefined) next.output = { ...next.output };
        if (text) next.output.message = text;
        if (data !== undefined) next.output.object = data;
      }
      return next;
    }
    case "/turn/full":
      return { ...current, turns: [...current.turns, record.turn] };
    case "/tool/yield": {
      const output = { ...current.output };
      for (const [key, value] of Object.entries(record.result.output ?? {})) {
        if (key === "message" || key === "object") {
          if (value != null) output[key] = value;
          continue;
        }
        output[key] = [...(output[key] ?? []), ...(Array.isArray(value) ? value : [value])];
      }
      return { ...current, output };
    }
    case "/response/close":
      return {
        ...current,
        meta: record.meta,
        condition: record.meta?.state === "complete" ? "NOMINAL" : "ERROR",
      };
    case "/tool/call":
      return current;
    default:
      return { ...current, open: pour(current.open, record) };
  }
}

export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
    const part = turn.parts[index];
    const shell = {};
    const delta = {};
    for (const [key, value] of Object.entries(part)) {
      if (key === "type") {
        shell.type = value;
        continue;
      }
      if (typeof value === "string") {
        shell[key] = "";
        delta[key] = value;
      } else {
        delta[key] = value;
      }
    }
    yield { event: "/part/open", index, part: shell };
    if (Object.keys(delta).length) yield { event: "/part/delta", index, delta };
    yield { event: "/part/close", index };
  }
  yield { event: "/turn/close", meta: turn.meta ?? {} };
}

export function attend(stream, onSealed) {
  let turn = null;
  return (async function* () {
    for await (const packet of stream) {
      turn = pour(turn, packet);
      yield packet;
    }
    if (onSealed) await onSealed(turn);
  })();
}

export async function bridge(stream) {
  let turn = null;
  for await (const packet of stream) {
    turn = pour(turn, packet);
  }
  return turn;
}

// three ways to consume a packet stream — one core (pour), thin cases by output shape:
// bridge → the awaited final turn · attend → packets + on-seal callback · scan → the running turn per packet
export async function* scan(stream) {
  let turn = null;
  for await (const packet of stream) {
    turn = pour(turn, packet);
    yield turn;
  }
}

export function tee(source) {
  const aBuffer = [];
  const bBuffer = [];
  const aGate = waiter();
  const bGate = waiter();
  let done = false;

  (async () => {
    try {
      for await (const item of source) {
        aBuffer.push(item);
        bBuffer.push(item);
        aGate.wake();
        bGate.wake();
      }
    } finally {
      done = true;
      aGate.wake();
      bGate.wake();
    }
  })();

  const branch = (buffer, gate) => ({
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      while (true) {
        if (buffer.length) return { value: buffer.shift(), done: false };
        if (done) return { value: undefined, done: true };
        await gate.wait();
      }
    },
  });

  return [branch(aBuffer, aGate), branch(bBuffer, bGate)];
}

export async function* textFromPackets(packets) {
  for await (const packet of packets) {
    if (packet.event === "/part/delta" && typeof packet.delta?.text === "string") {
      yield packet.delta.text;
    }
  }
}

export async function* channel(source, name) {
  for await (const packet of source) yield { ...packet, channel: name };
}

export async function* merge(...sources) {
  const iterators = sources.map((source) => source[Symbol.asyncIterator]());
  const pending = new Map(
    iterators.map((iterator, index) => [
      index,
      iterator.next().then((result) => ({ index, result })),
    ]),
  );
  try {
    while (pending.size) {
      const { index, result } = await Promise.race(pending.values());
      if (result.done) {
        pending.delete(index);
        continue;
      }
      yield result.value;
      pending.set(
        index,
        iterators[index].next().then((next) => ({ index, result: next })),
      );
    }
  } finally {
    for (const iterator of iterators) iterator.return?.();
  }
}

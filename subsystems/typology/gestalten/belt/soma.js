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
        part[key] = typeof value === "string" && typeof part[key] === "string"
          ? part[key] + value
          : value;
      }
      break;
    }
    case "/part/close":
      break;
    case "/turn/close":
      turn.meta = packet.meta;
      break;
  }
  return turn;
}

export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
    const part = turn.parts[index];
    const shell = {};
    const delta = {};
    for (const [key, value] of Object.entries(part)) {
      if (key === "type") { shell.type = value; continue; }
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
    [Symbol.asyncIterator]() { return this; },
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

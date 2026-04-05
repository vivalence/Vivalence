export function pour(turn, packet) {
  switch (packet.event) {
    case "turn.open":
      return { ...packet.turn, parts: [] };
    case "part.open":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "part.delta": {
      const part = turn.parts[packet.index];
      for (const [key, value] of Object.entries(packet.delta)) {
        part[key] = typeof value === "string" && typeof part[key] === "string"
          ? part[key] + value
          : value;
      }
      break;
    }
    case "part.close":
      break;
    case "turn.close":
      turn.meta = packet.meta;
      break;
  }
  return turn;
}

export function* drain(turn) {
  yield { event: "turn.open", turn: { role: turn.role } };
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
    yield { event: "part.open", index, part: shell };
    if (Object.keys(delta).length) yield { event: "part.delta", index, delta };
    yield { event: "part.close", index };
  }
  yield { event: "turn.close", meta: turn.meta ?? {} };
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

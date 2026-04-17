// accumulate — reduces stream packets into a sealed turn
// observe — wraps a stream to accumulate + call back when sealed

export function accumulate(turn, packet) {
  switch (packet.event) {
    case "turn.open":
      return { ...packet.turn, parts: [] };
    case "part.open":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "part.delta": {
      const part = turn.parts[packet.index];
      for (const [k, v] of Object.entries(packet.delta)) {
        part[k] = typeof v === "string" && typeof part[k] === "string" ? part[k] + v : v;
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

// observe: wraps an async iterable of packets.
// consumer iterates normally. on drain, onSealed fires with the accumulated turn.
export function observe(stream, onSealed) {
  let turn = null;
  return (async function* () {
    for await (const packet of stream) {
      turn = accumulate(turn, packet);
      yield packet;
    }
    if (onSealed) await onSealed(turn);
  })();
}

// drain: consume a stream fully, return the sealed turn
export async function drain(stream) {
  let turn = null;
  for await (const packet of stream) {
    turn = accumulate(turn, packet);
  }
  return turn;
}

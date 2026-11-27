import { waiter } from "./promise.js";
import { yield as yielded } from "../fromm/yield.js";

const grown = (part, carried) => {
  for (const [key, value] of Object.entries(carried))
    part[key] = typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
  return part;
};

const TURN = {
  open: (turn, carried) => ({ ...carried, parts: [] }),
  eager: (turn) => turn,
  resume: (turn) => turn,
  close: (turn, carried) => ({ ...turn, ...carried }),
  full: (turn, carried) => carried,
};

const PART = {
  open: (part, carried) => ({ ...carried }),
  delta: grown,
  draft: (part, carried) => ({ ...part, draft: carried }),
  full: (part, carried) => ({ ...carried }),
  close: ({ draft, ...part }) => part,
};

export function pour(turn, packet) {
  const [, noun, act] = packet.event.split("/");
  if (noun === "turn") return TURN[act](turn, packet.turn);
  if (noun === "part") turn.parts[packet.index] = PART[act](turn.parts[packet.index], packet.part);
  return turn;
}

const gathered = (product, yielded) => {
  const next = { ...product };
  for (const [key, value] of Object.entries(yielded)) {
    if (key === "message" || key === "object") {
      if (value != null) next[key] = value;
      continue;
    }
    next[key] = [...(next[key] ?? []), ...(Array.isArray(value) ? value : [value])];
  }
  return next;
};

export const files = (parts) =>
  parts.flatMap((part) => {
    if (part.type === "file") return [part.file];
    if (part.type === "tool_result" && "file" in part.product)
      return part.product.file.map((file) => file.id);
    return [];
  });

export const spoken = (transcript) =>
  [...transcript.turns, ...(transcript.open ? [transcript.open] : [])]
    .flatMap((turn) => turn.parts)
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ");

export function transcript(state, record) {
  const current = state ?? {
    open: null,
    condition: null,
    turns: [],
    product: {},
    meta: undefined,
  };
  switch (record.event) {
    case "/turn/open":
      return { ...current, open: pour(null, record) };
    case "/turn/close": {
      const sealed = pour(current.open, record);
      const next = { ...current, turns: [...current.turns, sealed], open: null };
      if (sealed.role === "assistant") next.product = { ...next.product, ...yielded(sealed).product };
      return next;
    }
    case "/turn/full": {
      const results = record.turn.parts.filter((part) => part.type === "tool_result");
      return {
        ...current,
        turns: [...current.turns, record.turn],
        product: results.reduce((product, part) => gathered(product, part.product), current.product),
      };
    }
    case "/part/full":
      if (!record.turn) return { ...current, open: pour(current.open, record) };
      return {
        ...current,
        turns: current.turns.map((turn) =>
          turn.id === record.turn ? { ...turn, parts: turn.parts.with(record.index, record.part) } : turn,
        ),
      };
    case "/response/close":
      return {
        ...current,
        meta: record.response.meta,
        condition: record.response.meta.state === "complete" ? "NOMINAL" : "ERROR",
      };
    default:
      return { ...current, open: pour(current.open, record) };
  }
}

const opened = (value) => {
  if (typeof value === "string") return "";
  if (value !== null && typeof value === "object" && !Array.isArray(value)) return {};
  return value;
};

export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
    const { type, mime, ...fields } = turn.parts[index];
    const entries = Object.entries(fields);
    const shell = {
      type,
      ...(mime !== undefined && { mime }),
      ...Object.fromEntries(entries.map(([key, value]) => [key, opened(value)])),
    };
    const part = Object.fromEntries(entries.filter(([, value]) => opened(value) !== value));
    yield { event: "/part/open", index, part: shell };
    if (Object.keys(part).length) yield { event: "/part/delta", index, part };
    yield { event: "/part/close", index };
  }
  yield { event: "/turn/close", turn: { meta: turn.meta ?? {} } };
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
    if (packet.event === "/part/delta" && typeof packet.part.text === "string") {
      yield packet.part.text;
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

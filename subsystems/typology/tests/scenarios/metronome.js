import { promise, sleep, soma } from "@vivalence/typology";

export const until = async (predicate, ms = 5000) => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw new Error("timeout");
    await sleep.ms(5);
  }
};

export const tick = () => sleep.ms(20);

export function metronome(script, type = "dialogue") {
  const seen = { requests: [], aborted: [] };
  const gate = promise.waiter();
  let cursor = 0;
  let budget = 0;
  const grains = (step) =>
    step.tool
      ? [[
          { event: "/turn/open", turn: { role: "assistant" } },
          { event: "/part/open", index: 0, part: { type: "tool_use", ...step.tool } },
          { event: "/part/close", index: 0 },
          { event: "/turn/close", meta: { state: "tools" } },
        ]]
      : step.deltas
        ? Array.from({ length: step.deltas }, (_, index) => [
            ...(index === 0 ? [{ event: "/turn/open", turn: { role: "assistant" } }, { event: "/part/open", index: 0, part: { type: "text", text: "" } }] : []),
            { event: "/part/delta", index: 0, delta: { text: "." } },
            ...(index === step.deltas - 1 ? [{ event: "/part/close", index: 0 }, { event: "/turn/close", meta: { state: step.state ?? "complete" } }] : []),
          ])
        : step.packets.map((packet) => [packet]);
  async function* stream(request, { signal } = {}) {
    seen.requests.push(request);
    const step = (typeof script === "function" ? script(cursor++) : script[cursor++]) ?? { packets: [] };
    if (step.fault) throw Object.assign(new Error(step.fault), { retryable: true });
    for (const grain of grains(step)) {
      while (budget === 0 && !signal?.aborted) await gate.wait(signal);
      if (signal?.aborted) return void seen.aborted.push(signal.reason);
      budget -= 1;
      yield* grain;
    }
  }
  return {
    seen,
    release: (n = 1) => {
      budget += n;
      gate.wake();
    },
    faculty: {
      type,
      tune: [0.5, 0.5, 0.5, 0.5],
      channels: { in: ["text"], out: ["text"] },
      via: { stream, render: (request, options) => collect(stream(request, options)) },
    },
  };
}

async function collect(packets) {
  let turn = null;
  for await (const packet of packets) turn = soma.pour(turn, packet);
  return turn;
}

export function ledger(repository) {
  const rows = [];
  const seen = new Map();
  const frame = (row) => ({
    id: row.id,
    status: row.status,
    error: row.error?.code ?? null,
    last: row.steps?.at(-1) ? `${row.steps.at(-1).path} ${row.steps.at(-1).verb}` : null,
  });
  const off = repository.$entities.subscribe((held) => {
    for (const row of held) {
      const now = frame(row);
      const before = seen.get(row.id);
      if (!before) rows.push({ op: "create", ...now });
      else if (JSON.stringify(before) !== JSON.stringify(now)) rows.push({ op: "update", ...now });
      seen.set(row.id, now);
    }
    for (const id of [...seen.keys()])
      if (!held.some((row) => row.id === id)) {
        rows.push({ op: "delete", id });
        seen.delete(id);
      }
  });
  return {
    rows,
    off,
    walk: (id) =>
      rows
        .filter((row) => row.id === id)
        .map((row) => (row.op === "update" ? row.status : row.op))
        .filter((mark, index, marks) => mark !== marks[index - 1]),
  };
}

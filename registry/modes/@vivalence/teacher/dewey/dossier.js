const TRANSLATED = (literal) => literal.trait?.TRANSLATED;
const EXEMPLIFIED = (literal) => literal.trait?.EXEMPLIFIED;

const recentRecord = (trace) => ({
  slug: trace.literal.slug,
  learning: TRANSLATED(trace.literal)?.learning,
  known: TRANSLATED(trace.literal)?.known,
  example: EXEMPLIFIED(trace.literal),
  signal: trace.signal?.enum,
  status: trace.status,
});

const dueRecord = (literal) => ({
  slug: literal.slug,
  learning: TRANSLATED(literal)?.learning,
  known: TRANSLATED(literal)?.known,
  example: EXEMPLIFIED(literal),
  status: literal.memory?.status ?? "UNTOUCHED",
  overdueHours: literal.memory?.nextAt
    ? Math.max(0, (Date.now() - literal.memory.nextAt.getTime()) / 3.6e6)
    : null,
});

const weakRecord = (literal) => ({
  slug: literal.slug,
  learning: TRANSLATED(literal)?.learning,
  known: TRANSLATED(literal)?.known,
  example: EXEMPLIFIED(literal),
  status: literal.memory?.status ?? "UNTOUCHED",
  strength: literal.memory?.strength ?? 0,
});

export async function gather(ctx, where = { ontology: "word" }) {
  const { daemon } = ctx;

  const [traces, due, weakRaw, memories, totalLiterals] = await Promise.all([
    daemon.entities.trace.find(
      {},
      { orderBy: { createdAt: "DESC" }, limit: 30, populate: ["literal"] },
    ),
    daemon.entities.literal.due(where, { limit: 20, populate: ["memories"] }),
    daemon.entities.literal.byStrength(where, { limit: 20, populate: ["memories"] }),
    daemon.entities.memory.find({}, { fields: ["status"] }),
    daemon.entities.literal.count(where),
  ]);

  const histogram = { UNTOUCHED: 0, UNKNOWN: 0, LEARNING: 0, KNOWN: 0, GRADUATED: 0 };
  for (const memory of memories) histogram[memory.status] = (histogram[memory.status] ?? 0) + 1;
  histogram.UNTOUCHED = Math.max(0, totalLiterals - memories.length);

  const recent = traces.slice(0, 20).map(recentRecord);
  const mistakes = traces
    .filter((t) => ["MISTAKE", "FAILURE"].includes(t.signal?.enum))
    .slice(0, 5)
    .map(recentRecord);

  const data = {
    histogram,
    weak: weakRaw.filter((l) => l.memory).slice(0, 5).map(weakRecord),
    recent,
    due: due.map(dueRecord),
    mistakes,
  };

  return { ...data, toPrompt: () => prompt(data), toJSON: () => data };
}

function prompt({ histogram, weak, recent, due, mistakes }) {
  const hist = Object.entries(histogram).map(([k, v]) => `${k}=${v}`).join(" ");

  const line = (r) => {
    const meta = [];
    if (r.signal) meta.push(r.signal);
    if (r.status && r.status !== "UNKNOWN") meta.push(r.status);
    if (r.strength != null) meta.push(`s=${r.strength.toFixed(2)}`);
    if (r.overdueHours != null) meta.push(`+${r.overdueHours.toFixed(1)}h`);
    const tag = meta.length ? ` [${meta.join(" ")}]` : "";
    const ex = r.example?.learning ? ` "${r.example.learning}"` : "";
    return `- ${r.learning ?? r.slug} (${r.known ?? "?"})${tag}${ex}`;
  };

  return [
    `State: ${hist}`,
    "",
    "Weakest:",
    weak.length ? weak.map(line).join("\n") : "(none)",
    "",
    "Recent (20):",
    recent.length ? recent.map(line).join("\n") : "(none)",
    "",
    "Due (20):",
    due.length ? due.map(line).join("\n") : "(none)",
    "",
    "Mistakes (5):",
    mistakes.length ? mistakes.map(line).join("\n") : "(none)",
  ].join("\n");
}


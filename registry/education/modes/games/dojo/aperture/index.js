import { Vector, object, v } from "@vivalence/typology";
import * as hal from "../hal/index.js";
import * as types from "../types.js";
import * as fold from "../fold.js";
import { resolve, projection, count } from "../set/index.js";

const JUDGE_INPUT = v.object({
  typed: v.string().desc("What the learner wrote."),
  knowable: types.knowable.desc("The knowable being judged — carries both faces, its tokens and its literal."),
  recall: v.enum(["KNOWN", "LEARNING"]).desc("Which face the learner had to produce."),
});

const RESOLVE_INPUT = v.object({
  set: types.set,
  prompt: types.prompt.optional(),
  blacklist: v.array(v.rel(v.literal())).desc("Ids already played — continuous refill passes them.").optional(),
});

const COUNT_INPUT = v.object({
  wheres: v.array(types.query).desc("Queries to count under the ontology guard — one count per entry, pick-independent."),
});

const SYMBOLS_INPUT = v.object({
  search: v.string().desc("Matched against the symbol slug and its LABELED name.").optional(),
  traits: v
    .array(v.enum(types.SYMBOL_TRAITS))
    .desc("Symbol kinds that qualify — the symbol repository's traits.$overlap.")
    .optional(),
  limit: v.integer({ minimum: 1 }).desc("Rows returned, by literal count. Omit = every symbol that matches.").optional(),
});

const SETUP_INPUT = v.object({
  buffer: v.string().desc("The dojo buffer being set up."),
  set: types.set.optional(),
  ...types.AXES,
});

const SESSION_INPUT = v.object({
  buffer: v.string().desc("The dojo buffer whose live session is being kept."),
  session: v
    .object({})
    .desc(
      "The player's session as it stands — streak state, phase, counters; `queue` rides only when it changed (a keep without one inherits the kept queue). Omit = the session is over.",
    )
    .optional(),
});

const COMMISSION_INPUT = v.object({
  buffer: v.string().desc("The dojo buffer — its own declared set drives the draw."),
});

const keepQuietly = async (entities, buffer, data) => {
  const em = entities.em;
  const meta = em.getMetadata().get(entities.buffer.getEntityName());
  const table = meta.tableName;
  const column = (property) => meta.properties[property].fieldNames[0];
  await em.getConnection().execute(`update ${table} set ${column("data")} = ? where ${column("id")} = ?`, [JSON.stringify(data), buffer.id]);
  await em.refresh(buffer);
};

const held = (ctx) =>
  ctx.daemon.entities.buffer.findOneOrFail(
    { id: ctx.input.buffer },
    { populate: ["literals", "symbols"] },
  );

const review = async (ctx, identifier, grade) => {
  if (!identifier || !grade) return;
  const literal = await ctx.daemon.entities.literal.findOne(identifier);
  if (!literal) return;
  return literal.review(grade, ctx);
};

const row = (literal) => ({
  ...fold.fromLiteral(literal),
  slug: literal.slug,
  rank: literal.rank,
  status: literal.retention?.status ?? "UNTOUCHED",
});

const rows = (resolved) => ({
  clauses: resolved.clauses.map((entry) => ({
    count: entry.count,
    literals: entry.literals.map(row),
    knowables: entry.knowables,
  })),
  total: resolved.literals.length + resolved.knowables.length,
});

export const aperture = new Vector()
  .open({ nature: "/resolve", input: RESOLVE_INPUT }, async (ctx) => {
    const resolved = await resolve(
      ctx,
      { set: ctx.input.set },
      { prompt: ctx.input.prompt, blacklist: ctx.input.blacklist ?? [] },
    );
    return rows(resolved);
  })

  .open({ nature: "/count", input: COUNT_INPUT }, async (ctx) => ({
    counts: await Promise.all(ctx.input.wheres.map((where) => count(ctx, where))),
  }))

  .open({ nature: "/setup", input: SETUP_INPUT }, async (ctx) => {
    const buffer = await held(ctx);
    const set = ctx.input.set ?? buffer.data?.set ?? [];
    buffer.data = {
      ...object.pluck(buffer.data ?? {}, ["knowables", "target", "session"]),
      ...object.pluck(ctx.input, types.SETUP),
      set,
    };
    buffer.symbols.set(await ctx.daemon.entities.symbol.findByIdentifiers(projection(set)));
    await ctx.daemon.entities.em.flush();
    return buffer;
  })

  .open({ nature: "/session", input: SESSION_INPUT }, async (ctx) => {
    const buffer = await ctx.daemon.entities.buffer.findOneOrFail({ id: ctx.input.buffer });
    const { session: previous, ...rest } = buffer.data ?? {};
    const incoming = ctx.input.session;
    const next = incoming
      ? { ...rest, session: { ...incoming, queue: incoming.queue ?? previous?.queue ?? [] } }
      : rest;
    await keepQuietly(ctx.daemon.entities, buffer, next);
    return { session: Boolean(incoming) };
  })

  .open({ nature: "/commission", input: COMMISSION_INPUT }, async (ctx) => {
    const buffer = await held(ctx);
    const resolved = await resolve(ctx, { set: buffer.data?.set ?? [] }, { prompt: buffer.data?.prompt });
    buffer.literals.set(resolved.literals);
    buffer.data = { ...buffer.data, knowables: resolved.knowables };
    await ctx.daemon.entities.em.flush();
    return buffer;
  })

  .open({ nature: "/symbols", input: SYMBOLS_INPUT }, async (ctx) => {
    const { search, traits, limit } = ctx.input;
    const like = search ? `%${search}%` : null;
    const where = {
      ...(like
        ? { $or: [{ slug: { $like: like } }, { trait: { LABELED: { name: { $like: like } } } }] }
        : {}),
      ...(traits?.length ? { traits: { $overlap: traits } } : {}),
    };
    const [symbols, tallies] = await Promise.all([
      ctx.daemon.entities.symbol.find(where),
      ctx.daemon.entities.em
        .getConnection()
        .execute(
          "SELECT symbol_entity_id AS symbol, count(*) AS literals FROM symbol_literals GROUP BY symbol_entity_id",
        ),
    ]);
    const counted = new Map(tallies.map((tally) => [tally.symbol, Number(tally.literals)]));
    return symbols
      .map((symbol) => ({
        slug: symbol.slug,
        traits: symbol.traits ?? [],
        literals: counted.get(symbol.id) ?? 0,
        ...(symbol.trait?.LABELED?.name ? { name: symbol.trait.LABELED.name } : {}),
      }))
      .sort((left, right) => right.literals - left.literals || left.slug.localeCompare(right.slug))
      .slice(0, limit ?? Infinity);
  })

  .open({ nature: "/traits" }, async (ctx) => {
    const counts = await Promise.all(types.TRAITS.map((name) => count(ctx, { traits: [name] })));
    return types.TRAITS.map((name, index) => ({ name, literals: counts[index] }));
  })

  /* @beef benched — the ✦ assistant, future music. Revive as /provision {text, state:{set, axes}}
     → {reply, clause?, axes?}: ONE rule proposal the drawer loads INTO THE BUILDER, axes applied
     directly; never adds, never starts.

  .open({ nature: "/provision", input: PROVISION_INPUT }, async (ctx) => {
    const language = ctx.daemon.statics.language;
    const symbols = await ctx.daemon.entities.symbol.find({});
    const render = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "balanced" },
      system: { identity: hal.provision.identity(language) },
      turns: [{ role: "user", parts: [{ type: "text", text: hal.provision.request(vocabulary(symbols), ctx.input.state ?? {}, ctx.input.text) }] }],
      output: { schema: hal.provision.output },
    });
    const out = render.output.object ?? {};
    if (!out.clause) return out;
    const { set, unknown } = await validated(ctx, [out.clause]);
    return { ...out, clause: set[0], ...(unknown.length ? { reply: `${out.reply ?? ""} Unknown symbols dropped: ${unknown.join(", ")}.`.trim() } : {}) };
  })

  const PROVISION_INPUT = v.object({
    text: v.string().desc("Freeform request — a rule to build, axes to set."),
    state: v.object({ set: types.set.optional(), axes: v.object({}).optional() }).desc("The buffer's current declared state.").optional(),
  });
  const GROUP_LIMIT = 40;
  const vocabulary = (symbols) => {
    const groups = new Map();
    for (const symbol of symbols) {
      const parts = symbol.slug.split(".");
      const prefix = parts.length > 1 ? parts.slice(0, -1).join(".") : "";
      if (!groups.has(prefix)) groups.set(prefix, []);
      groups.get(prefix).push(symbol);
    }
    return [...groups.entries()].map(([prefix, members]) =>
      members.length > GROUP_LIMIT
        ? `${prefix}.* — ${members.length} symbols shaped ${prefix}.<value>, e.g. ${members.slice(0, 5).map((symbol) => symbol.slug).join(", ")}`
        : members.map((symbol) => symbol.slug).join(", "),
    );
  };
  const validated = async (ctx, set = []) => {
    const wanted = projection(set);
    if (!wanted.length) return { set, unknown: [] };
    const known = new Set((await ctx.daemon.entities.symbol.find({ slug: { $in: wanted } })).map((symbol) => symbol.slug));
    const unknown = wanted.filter((slug) => !known.has(slug));
    if (!unknown.length) return { set, unknown };
    const keep = (slugs) => slugs?.filter((slug) => known.has(slug));
    const cleaned = set.map((clause) => {
      const symbols = clause.where?.symbols;
      if (!symbols) return clause;
      const next = Array.isArray(symbols) ? keep(symbols) : { $all: keep(symbols.$all), $in: keep(symbols.$in), $none: keep(symbols.$none) };
      return { ...clause, where: { ...clause.where, symbols: next } };
    });
    return { set: cleaned, unknown };
  };
  */

  .open({ nature: "/judge", input: JUDGE_INPUT }, async (ctx) => {
    const language = ctx.daemon.statics.language;
    const knowable = ctx.input.knowable;
    const tokens = knowable.tokens ?? [];

    const render = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "balanced" },
      system: {
        rubric: hal.judge.rubric(language, {
          typed: ctx.input.typed,
          known: knowable.known,
          learning: knowable.learning,
          recall: ctx.input.recall,
          tokens,
        }),
      },
      turns: [],
      output: { schema: hal.judge.output },
    });

    const evaluation = render.output.object;
    const graded = tokens.map((token, index) => ({
      ...token,
      ...(evaluation?.tokens?.find((entry) => entry.index === index) ?? {
        grade: evaluation?.overall?.grade,
      }),
    }));

    await Promise.all([
      review(ctx, knowable.literal, evaluation?.overall?.grade),
      ...graded.map((token) => review(ctx, token.literal, token.grade)),
    ]);

    await ctx.daemon.entities.em.flush();

    return { overall: evaluation?.overall, tokens: graded };
  });

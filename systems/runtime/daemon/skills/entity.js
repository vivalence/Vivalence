import { v, Vector } from "@vivalence/typology";

const BUDGET = 10_000;
const OPERATORS = [
  "$eq",
  "$ne",
  "$in",
  "$nin",
  "$like",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$and",
  "$or",
  "$not",
];

const repositories = (daemon) =>
  Object.fromEntries(
    Object.entries(daemon.entities).filter(
      ([, repository]) => typeof repository?.getEntityName === "function",
    ),
  );

const CARD = {
  fields: ["id", "slug", "traits"],
  populate: [],
  project: (row) => ({
    id: row.id,
    ...(row.slug && { slug: row.slug }),
    ...(row.traits?.length && { traits: row.traits }),
  }),
};

const cardOf = (repository) => repository.card ?? CARD;

const unknown = (daemon, name) => ({
  condition: "ERROR",
  output: {
    message: `unknown entity '${name}' — this daemon has: ${
      Object.keys(repositories(daemon)).join(", ")
    }`,
  },
});

export const entity = new Vector()
  .open(
    {
      nature: "/entity/schema",
      valence:
        "Ground yourself before querying. No arguments: every entity on this daemon with row " +
        "counts and card fields. With entity: its columns, relations, filter operators, " +
        "repository extensions and the card projection.",
      input: v.object({
        entity: v.string().desc("Entity type from the no-argument listing.").optional(),
      }),
    },
    async (ctx) => {
      const repos = repositories(ctx.daemon);
      if (!ctx.input.entity) {
        const entities = await Promise.all(
          Object.entries(repos).map(async ([type, repository]) => ({
            type,
            rows: await repository.count({}),
            card: cardOf(repository).fields,
          })),
        );
        return { output: { entities } };
      }
      const repository = repos[ctx.input.entity];
      if (!repository) return unknown(ctx.daemon, ctx.input.entity);
      const metadata = ctx.daemon.entities.em.getMetadata().get(repository.getEntityName());
      const columns = {};
      const relations = {};
      for (const property of Object.values(metadata.properties)) {
        if (property.kind === "scalar") columns[property.name] = property.type;
        else relations[property.name] = `${property.kind} ${property.type}`;
      }
      return {
        output: {
          schema: {
            entity: ctx.input.entity,
            rows: await repository.count({}),
            columns,
            relations,
            operators: OPERATORS,
            extensions: repository.extensions ?? {},
            card: cardOf(repository).fields,
          },
        },
      };
    },
  )
  .open(
    {
      nature: "/entity/find",
      valence:
        "Query any entity on this daemon. Rows come back as cards — the lean agent projection; " +
        "fields full only when a card lacks something you need. Columns, operators and " +
        "extensions via entity_schema. Page by passing next.offset back as offset.",
      input: v.object({
        entity: v.string().desc("Entity type — list them via entity_schema."),
        where: v.record(v.string(), v.unknown()).desc("MikroORM filter.").optional(),
        fields: v.enum(["card", "full"], { default: "card" }),
        order: v.record(v.string(), v.enum(["ASC", "DESC"])).optional(),
        limit: v.integer({ minimum: 1, maximum: 50 }).default(12),
        offset: v.integer({ minimum: 0 }).default(0),
      }),
    },
    async (ctx) => {
      const repository = repositories(ctx.daemon)[ctx.input.entity];
      if (!repository) return unknown(ctx.daemon, ctx.input.entity);
      const { where = {}, fields, order, limit, offset } = ctx.input;
      const card = cardOf(repository);
      const rows = await repository.find(where, {
        limit,
        offset,
        ...(order && { orderBy: order }),
        ...(fields === "card" && card.populate.length && { populate: card.populate }),
      });
      const total = await repository.count(where);
      const projected = fields === "card"
        ? rows.map(card.project)
        : rows.map((row) => row.toJSON?.() ?? row);
      while (projected.length > 1 && JSON.stringify(projected).length > BUDGET) projected.pop();
      const served = offset + projected.length;
      return {
        output: {
          [ctx.input.entity]: projected,
          total,
          ...(projected.length < rows.length && {
            message: `trimmed to ${projected.length} of ${rows.length} loaded rows to stay under ` +
              `the result budget — narrow with where or page with offset`,
          }),
          ...(served < total && { next: { offset: served } }),
        },
      };
    },
  )
  .open(
    {
      nature: "/entity/count",
      valence: "Count matching rows without loading them — cheap grounding before a find.",
      input: v.object({
        entity: v.string().desc("Entity type — list them via entity_schema."),
        where: v.record(v.string(), v.unknown()).desc("MikroORM filter.").optional(),
      }),
    },
    async (ctx) => {
      const repository = repositories(ctx.daemon)[ctx.input.entity];
      if (!repository) return unknown(ctx.daemon, ctx.input.entity);
      return { output: { count: await repository.count(ctx.input.where ?? {}) } };
    },
  );

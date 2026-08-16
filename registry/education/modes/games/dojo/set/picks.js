import { object } from "@vivalence/typology";
import * as fold from "../fold.js";
import * as types from "../types.js";
import { compile } from "./where.js";

const RETENTION = ["retentions"];

const resolved = (repository, where) =>
  repository.resolveTraits(repository.resolveSearch(repository.resolveSymbols(where)));

export const count = (ctx, where) => {
  const repository = ctx.daemon.entities.literal;
  return repository.count(resolved(repository, compile(where)));
};

const stream = (method) => async (ctx, clause, { blacklist, limit }) => ({
  literals: await ctx.daemon.entities.literal[method](compile(clause.where), {
    limit,
    blacklist: { literals: blacklist },
    populate: RETENTION,
  }),
});

export const picks = {
  all: async (ctx, clause, { blacklist, limit }) => {
    const repository = ctx.daemon.entities.literal;
    const where = compile(clause.where);
    const [total, literals] = await Promise.all([
      repository.count(resolved(repository, where)),
      repository.find(object.merge(where, { id: { $nin: blacklist } }), {
        limit,
        orderBy: { rank: "ASC" },
        populate: RETENTION,
      }),
    ]);
    return { literals, count: total };
  },

  feed: stream("feed"),
  due: stream("due"),
  novel: stream("novel"),
  byStrength: stream("byStrength"),

  byLastSignal: async (ctx, clause, { blacklist, limit }) => ({
    literals: await ctx.daemon.entities.literal.byLastSignal(
      clause.signals?.length ? clause.signals : types.MISSED,
      compile(clause.where),
      { limit, blacklist: { literals: blacklist }, populate: RETENTION },
    ),
  }),

  sample: async (ctx, clause, { blacklist, limit }) => ({
    literals: await ctx.daemon.entities.literal.sample(compile(clause.where), {
      status: clause.status?.length ? clause.status : undefined,
      limit,
      blacklist: { literals: blacklist },
      populate: RETENTION,
    }),
  }),

  literals: async (ctx, clause) => ({
    literals: clause.literals?.length
      ? await ctx.daemon.entities.literal.findByIdentifiers(clause.literals, { populate: RETENTION })
      : [],
  }),

  authored: async (ctx, clause) => ({
    literals: [],
    knowables: (clause.knowables ?? []).map(fold.authored),
  }),
};

export const cap = (clause) => clause.limit ?? types.CAP;

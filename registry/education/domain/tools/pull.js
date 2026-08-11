import { v, Vector } from "@vivalence/typology";
import { RetentionStatusEnum } from "../entities/userspace/Retention.ts";

export const pull = new Vector().open(
  {
    nature: "/pull",
    valence: "The learner's live memory state. progress = counts per retention status plus the " +
      "weakest items; due = the review queue right now; novel = never-studied, by course " +
      "rank; weak = weakest retention first. Open every session with progress and due. " +
      'Example: { scope: "due", limit: 10 }.',
    input: v.object({
      scope: v.enum(["progress", "due", "novel", "weak"]),
      where: v
        .record(v.string(), v.unknown())
        .desc("Literal filter — ontology, symbols, search; columns via entity_schema.")
        .optional(),
      limit: v.integer({ minimum: 1, maximum: 30 }).default(10),
    }),
  },
  async (ctx) => {
    const literal = ctx.daemon.entities.literal;
    const card = literal.card;
    const { scope, where = {}, limit } = ctx.input;

    if (scope === "progress") {
      const statuses = {};
      for (const status of Object.values(RetentionStatusEnum)) {
        statuses[status] = await literal.count({ ...where, retentions: { status } });
      }
      const total = await literal.count(where);
      const tracked = Object.values(statuses).reduce((sum, count) => sum + count, 0);
      statuses.UNTOUCHED += Math.max(0, total - tracked);
      const weakest = await literal.byStrength(where, {
        limit: 5,
        populate: card.populate,
      });
      return { output: { statuses, weakest: weakest.map(card.project) } };
    }

    const fetch = {
      due: literal.due,
      novel: literal.novel,
      weak: literal.byStrength,
    }[scope];
    const rows = await fetch.call(literal, where, { limit, populate: card.populate });
    return { output: { literal: rows.map(card.project), count: rows.length } };
  },
);

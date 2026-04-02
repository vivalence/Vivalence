import { EntitySchema, types } from "@mikro-orm/core";
import { LiteralEntity } from "./Literal.ts";
import { SymbolEntity } from "./Symbol.ts";
import { drivers } from "../../memory/index.js";

export class ConjugationEntity {
  lemma;
  tense;
  mood;
  infinitive;
  firstSingular;
  secondSingular;
  thirdSingular;
  firstPlural;
  secondPlural;
  thirdPlural;
  minStrength;
  maxStrength;
  averageStrength;
  minRank;
  maxRank;
  averageRank;
}

// ── SQL building blocks ─────────────────────────────────────────────

const SL = "symbol_literals";
const pivot = (alias) => `JOIN ${SL} ${alias} ON ${alias}.literal_entity_id = l.id`;
const sym = (alias, pivot, pattern) =>
  `JOIN Symbol ${alias} ON ${alias}.id = ${pivot}.symbol_entity_id AND ${alias}.slug LIKE '${pattern}'`;

const slot = (person, number, alias) =>
  `MAX(CASE WHEN p.slug = '${person}' AND n.slug = '${number}' THEN l.id END) AS ${alias}`;

const rank = `COALESCE(json_extract(l.trait, '$.RANKED.rank'), 999999)`;

const infinitiveSubquery = `(
  SELECT l2.id FROM Literal l2
    JOIN ${SL} a ON a.literal_entity_id = l2.id
    JOIN Symbol sa ON sa.id = a.symbol_entity_id AND sa.slug = lemma.slug
    JOIN ${SL} b ON b.literal_entity_id = l2.id
    JOIN Symbol sb ON sb.id = b.symbol_entity_id AND sb.slug = 'word.verb-form.infinitive'
  LIMIT 1
)`;

const strengthCases = Object.values(drivers)
  .filter((d) => d.sql?.strength)
  .map((d) => `WHEN '${d.type}' THEN ${d.sql.strength("m")}`)
  .join(" ");

// ── Base paradigm query ─────────────────────────────────────────────

const paradigm = `
SELECT
  lemma.id  AS lemma_id,
  tense.id  AS tense_id,
  mood.id   AS mood_id,
  ${infinitiveSubquery} AS infinitive_id,
  ${slot("word.person.first", "word.number.singular", "first_singular_id")},
  ${slot("word.person.second", "word.number.singular", "second_singular_id")},
  ${slot("word.person.third", "word.number.singular", "third_singular_id")},
  ${slot("word.person.first", "word.number.plural", "first_plural_id")},
  ${slot("word.person.second", "word.number.plural", "second_plural_id")},
  ${slot("word.person.third", "word.number.plural", "third_plural_id")},
  MIN(${rank}) AS min_rank,
  MAX(${rank}) AS max_rank,
  AVG(${rank}) AS average_rank
FROM Literal l
  ${pivot("sl1")} ${sym("lemma", "sl1", "word.lemma.%")}
  ${pivot("sl2")} ${sym("tense", "sl2", "word.tense.%")}
  ${pivot("sl3")} ${sym("mood", "sl3", "word.mood.%")}
  ${pivot("sl4")} ${sym("p", "sl4", "word.person.%")}
  ${pivot("sl5")} ${sym("n", "sl5", "word.number.%")}
GROUP BY lemma.slug, tense.slug, mood.slug`;

// ── Expression: optionally enriched with user-scoped strength ───────

function expression(em, where, options) {
  const userId = em.getFilterParams("user")?.user;

  if (!userId) return paradigm;

  return `
WITH _paradigm AS (${paradigm}),
_strength AS (
  SELECT m.literal AS literal_id,
    CASE m.driver ${strengthCases} ELSE 0.0 END AS strength
  FROM Memory m
  WHERE m.user = '${userId}'
)
SELECT p.*,
  MIN(s.strength) AS min_strength,
  MAX(s.strength) AS max_strength,
  AVG(s.strength) AS average_strength
FROM _paradigm p
LEFT JOIN _strength s ON s.literal_id IN (
  p.first_singular_id, p.second_singular_id, p.third_singular_id,
  p.first_plural_id,   p.second_plural_id,   p.third_plural_id
)
GROUP BY p.lemma_id, p.tense_id, p.mood_id`;
}

// ── Schema ──────────────────────────────────────────────────────────

export const ConjugationSchema = new EntitySchema({
  class: ConjugationEntity,
  name: "Conjugation",
  expression,
  properties: {
    lemma: { kind: "m:1", entity: () => SymbolEntity, fieldName: "lemma_id" },
    tense: { kind: "m:1", entity: () => SymbolEntity, fieldName: "tense_id" },
    mood: { kind: "m:1", entity: () => SymbolEntity, fieldName: "mood_id" },
    infinitive: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "infinitive_id",
      nullable: true,
    },
    firstSingular: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "first_singular_id",
      nullable: true,
    },
    secondSingular: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "second_singular_id",
      nullable: true,
    },
    thirdSingular: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "third_singular_id",
      nullable: true,
    },
    firstPlural: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "first_plural_id",
      nullable: true,
    },
    secondPlural: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "second_plural_id",
      nullable: true,
    },
    thirdPlural: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "third_plural_id",
      nullable: true,
    },
    minStrength:     { type: types.float,   fieldName: "min_strength",     persist: false, nullable: true },
    maxStrength:     { type: types.float,   fieldName: "max_strength",     persist: false, nullable: true },
    averageStrength: { type: types.float,   fieldName: "average_strength", persist: false, nullable: true },
    minRank:         { type: types.integer, fieldName: "min_rank",         persist: false, nullable: true },
    maxRank:         { type: types.integer, fieldName: "max_rank",         persist: false, nullable: true },
    averageRank:     { type: types.float,   fieldName: "average_rank",     persist: false, nullable: true },
  },
});

export default {
  type: "conjugation",
  schema: ConjugationSchema,
  entity: ConjugationEntity,
};

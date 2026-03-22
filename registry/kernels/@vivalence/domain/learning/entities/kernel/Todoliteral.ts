import { types, Collection, EntitySchema } from "@mikro-orm/core";
import Ajv from "ajv";
import { maps } from "@vivalence/typology/entities";
import { PlayEntity } from "../userspace/Play.ts";
import { MemoryEntity } from "../userspace/Memory.ts";

// ─── Traits ──────────────────────────────────────────────────────────────────

export const LiteralTraitsEnum = {
  TRANSLATED: "TRANSLATED",
  EXEMPLIFIED: "EXEMPLIFIED",
  SORTED: "SORTED",
};

// ─── Trait Schemas (single source of truth) ───────────────────────────────────

export const traitSchemas = {
  TRANSLATED: {
    type: "object",
    properties: {
      known: { type: "string" },
      learning: { type: "string" },
    },
    required: ["known", "learning"],
    additionalProperties: false,
  },
  EXEMPLIFIED: {
    type: "object",
    properties: {
      known: { type: "string" },
      learning: { type: "string" },
    },
    required: ["known", "learning"],
    additionalProperties: false,
  },
  SORTED: {
    type: "object",
    properties: {
      index: { type: "integer" },
    },
    required: ["index"],
    additionalProperties: false,
  },
};

const ajv = new Ajv();

const validators = Object.fromEntries(
  Object.entries(traitSchemas).map(([trait, schema]) => [trait, ajv.compile(schema)]),
);

export class LiteralEntity extends maps.kernel.literal.entity {
  traits = [];
  memories = new Collection(this);
  plays = new Collection(this);

  //
  // topography = "brazilian-words" // ??
  // subject = "noun" // maybe entity? subject.literals

  // SORTED
  get sortIndex() {
    return this.trait.SORTED?.index ?? null;
  }
  set sortIndex(index) {
    this.trait = { ...this.trait, SORTED: { index } };
    if (!this.traits.includes(LiteralTraitsEnum.SORTED)) {
      this.traits.push(LiteralTraitsEnum.SORTED);
    }
  }

  get isComplete() {
    return Object.values(LiteralTraitsEnum).every((t) => this.traits.includes(t));
  }

  get missingTraits() {
    return Object.values(LiteralTraitsEnum).filter((t) => !this.traits.includes(t));
  }

  get dataSchema() {
    return {
      type: "object",
      properties: Object.fromEntries(this.traits.map((t) => [t, traitSchemas[t]])),
      required: this.traits,
      additionalProperties: false,
    };
  }

  validate() {
    for (const trait of this.traits) {
      const validate = validators[trait];
      if (!validate) continue; // unknown/future trait, skip
      if (!validate(this.trait[trait])) {
        throw new Error(`Literal.data.${trait} is invalid: ${ajv.errorsText(validate.errors)}`);
      }
    }
  }
}

export const LiteralSchema = new EntitySchema({
  class: LiteralEntity,
  extends: maps.kernel.literal.schema,
  tableName: "Literal",
  name: "Literal",
  hooks: {
    beforeCreate: ["validate"],
    beforeUpdate: ["validate"],
  },
  properties: {
    traits: {
      items: () => LiteralTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },
    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.literal,
    },
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.literal,
    },
  },
});

export default {
  type: "literal",
  traits: LiteralTraitsEnum,
  traitSchemas,
  schema: LiteralSchema,
  entity: LiteralEntity,
};

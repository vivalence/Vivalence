import { Cascade, types, EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ProductEntity, ValenceEntity } from "../index.ts";

export enum ModeTraitsEnum {
  VIEWABLE = "VIEWABLE", //
  DATASET = "DATASET", //
  VALENTIC = "VALENTIC", //
  PRODUCER = "PRODUCER", //
  CHAOSMONKEY = "CHAOSMONKEY", //
  TOPOGRAPHICAL = "TOPOGRAPHICAL", //
  BUFFERED = "BUFFERED",
}

export class ModeRepository extends DataRepository {
  unique(opt) {
    // ?? uniqueKeys = ["slug", "type"];
    return { type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;
  traits: ModeTraitsEnum[] & Opt = [];
  type?: string;
  installed: Boolean = false;

  valences = new Collection<ValenceEntity>(this);
  productions = new Collection<ProductEntity>(this);
  commissions = new Collection<ProductEntity>(this);
}

export const ModeSchema = new EntitySchema({
  class: ModeEntity,
  repository: () => ModeRepository,
  extends: DataSchema,
  name: "Mode",
  tableName: "Mode",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    traits: {
      items: () => ModeTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
    },

    installed: { type: types.boolean },

    productions: {
      kind: "1:m",
      entity: () => ProductEntity,
      mappedBy: (product) => product.producer,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
    },
    commissions: {
      kind: "1:m",
      entity: () => ProductEntity,
      mappedBy: (product) => product.commissioner,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
    },

    valences: {
      kind: "1:m",
      entity: () => ValenceEntity,
      mappedBy: (valence) => valence.mode,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
    },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};

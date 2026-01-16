import {
  types,
  EntitySchema,
  Collection,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ValenceEntity } from "../index.ts";

export enum ModeTraitsEnum {
  VIEWABLE = "VIEWABLE", //
  DATASET = "DATASET", //
  CASTING = "CASTING", //
  CHAOSMONKEY = "CHAOSMONKEY", //
  VALENTIC = "VALENTIC", //
  SESSIONED = "SESSIONED", //
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
  // products: Rel<ProductEntity>;
}

export const ModeSchema = new EntitySchema({
  class: ModeEntity,
  repository: () => ModeRepository,
  extends: DataSchema,
  name: "Mode",
  tableName: "Mode",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    type: { type: types.string, nullable: true },
    // traits: {type: types.json, enum: true, array: true, items: () => [], default: [],},
    traits: {
      items: () => ModeTraitsEnum,
      enum: true,
      array: true,
      default: [],
    },

    installed: { type: types.boolean },

    valences: {
      kind: "1:m",
      entity: () => ValenceEntity,
      mappedBy: (valence) => valence.mode,
    },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};

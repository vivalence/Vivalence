import {
  types,
  EntitySchema,
  Collection,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { ValenceEntity } from "./Valence.ts";

export class ModuleEntity extends BaseEntity {
  type!: string;
  slug!: string;
  traits: string[] & Opt = [];
  valences = new Collection<ValenceEntity>(this);
}

export const ModuleSchema = new EntitySchema({
  class: ModuleEntity,
  extends: BaseSchema,
  tableName: "Module",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    slug: { type: types.string },
    type: { type: types.string },
    traits: {
      type: types.array,
      defaultRaw: `"[]"`,
    },
    valences: {
      kind: "1:m",
      entity: () => ValenceEntity,
      mappedBy: (valence) => valence.module,
    },
  },
});

export default {
  schema: ModuleSchema,
  entity: ModuleEntity,
};

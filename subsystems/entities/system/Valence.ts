import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { ModuleEntity } from "./Module.ts";

export class ValenceEntity extends BaseEntity {
  slug!: string;
  docs!: string;
  resolve!: Record<string, any> & Opt = {}; // {generator:Path}
  module: Rel<ModuleEntity>;
  // signature
}

export const ValenceSchema = new EntitySchema({
  class: ValenceEntity,
  extends: BaseSchema,
  tableName: "Valence",
  uniques: [{ properties: ["slug", "module"] }],
  properties: {
    slug: { type: types.string },
    docs: { type: types.string },
    resolve: { type: types.json, defaultRaw: `"{}"` },

    module: {
      kind: "m:1",
      eager: true,
      nullable: true,
      entity: () => ModuleEntity,
      fieldName: "module",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
  },
});

export default {
  schema: ValenceSchema,
  entity: ValenceEntity,
};

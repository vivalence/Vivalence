import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import { symbol as base } from "@vivalence/runtime";



export class SymbolEntity extends base.entity {
  [EntityRepositoryType]?: typeof base.repository;
}

export const SymbolSchema = new EntitySchema({
  class: SymbolEntity,
  extends: base.schema,
  tableName: "Symbol",
  name: "Symbol",
  repository: () => base.repository,
  properties: {
  },
});

export default {
  type: "symbol",
  schema: SymbolSchema,
  entity: SymbolEntity,
  repository: base.repository,
};

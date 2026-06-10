import { EntitySchema } from "@mikro-orm/core";
import {
  BufferEntity, BufferSchema,
  LiteralEntity, LiteralSchema,
  SymbolEntity, SymbolSchema,
  DataRepository,
} from "@vivalence/typology/entities";

// Daemon-tier default concrete subclasses of the abstract bases.
// Used when no domain concretizes them (slim daemon). Domain overrides by type.
const concrete = (entity, base, name) => ({
  type: name.toLowerCase(),
  entity,
  schema: new EntitySchema({
    class: entity, extends: base, tableName: name, name, repository: () => DataRepository,
  }),
});

export const entities = {
  buffer:  concrete(BufferEntity,  BufferSchema,  "Buffer"),
  literal: concrete(LiteralEntity, LiteralSchema, "Literal"),
  symbol:  concrete(SymbolEntity,  SymbolSchema,  "Symbol"),
};

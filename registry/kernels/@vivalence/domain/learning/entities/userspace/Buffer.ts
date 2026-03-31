import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { buffer as base, DataRepository } from "@vivalence/typology/entities";

export class BufferEntity extends base.entity {}

export const BufferSchema = new EntitySchema({
  class: BufferEntity,
  extends: base.schema,
  tableName: "Buffer",
  name: "Buffer",
  repository: () => DataRepository,
  properties: {},
});

export default {
  type: "buffer",
  schema: BufferSchema,
  entity: BufferEntity,
};

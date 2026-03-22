import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { maps } from "@vivalence/typology/entities";

export class BufferEntity extends maps.userspace.buffer.entity {}

// export enum BufferTraits {
//   REVIEWED = "REVIEWED",
// }

export const BufferSchema = new EntitySchema({
  class: BufferEntity,
  extends: maps.userspace.buffer.schema,
  tableName: "Buffer",
  name: "Buffer",
  properties: {},
});

export default {
  type: "buffer",
  schema: BufferSchema,
  entity: BufferEntity,
};

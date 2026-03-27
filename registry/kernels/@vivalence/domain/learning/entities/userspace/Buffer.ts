import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
// import { maps } from "@vivalence/typology/entities";
import { buffer as base } from "@vivalence/typology/entities";

export class BufferEntity extends base.entity {}

// export enum BufferTraits {
//   REVIEWED = "REVIEWED",
// }

export const BufferSchema = new EntitySchema({
  class: BufferEntity,
  extends: base.schema,
  tableName: "Buffer",
  name: "Buffer",
  properties: {},
});

export default {
  type: "buffer",
  schema: BufferSchema,
  entity: BufferEntity,
};

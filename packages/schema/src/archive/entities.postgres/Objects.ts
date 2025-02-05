import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Buckets } from "./Buckets.ts";

export class Objects extends BaseModuleEntity {
  id!: string & Opt;
  bucket?: Rel<Buckets>;
  name?: string;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastAccessedAt?: Date;
  metadata?: any;
  pathTokens?: string[];
  version?: string;
  ownerId?: string;
}

export const ObjectsSchema = new EntitySchema({
  class: Objects,
  schema: "storage",
  indexes: [{ name: "idx_objects_bucket_id_name", properties: ["bucket", "name"] }],
  uniques: [{ name: "bucketid_objname", properties: ["bucket", "name"] }],
  properties: {
    id: { primary: true, type: "uuid", defaultRaw: `gen_random_uuid()` },
    bucket: { kind: "m:1", entity: () => Buckets, nullable: true },
    name: { type: "text", nullable: true, index: "name_prefix_search" },
    owner: {
      type: "uuid",
      nullable: true,
      comment: "Field is deprecated, use owner_id instead",
    },
    createdAt: { type: "datetime", nullable: true, defaultRaw: `now()` },
    updatedAt: { type: "datetime", nullable: true, defaultRaw: `now()` },
    lastAccessedAt: { type: "datetime", nullable: true, defaultRaw: `now()` },
    metadata: { type: "json", nullable: true },
    pathTokens: {
      type: "string[]",
      generated: "string_to_array(name, '/'::text) stored",
      nullable: true,
    },
    version: { type: "text", nullable: true },
    ownerId: { type: "text", nullable: true },
  },
});

import { BaseModuleEntity, Collection, EntitySchema } from "@mikro-orm/core";
import { Objects } from "./Objects.ts";
import { S3MultipartUploads } from "./S3MultipartUploads.ts";
import { S3MultipartUploadsParts } from "./S3MultipartUploadsParts.ts";

export class Buckets extends BaseModuleEntity {
  id!: string;
  name!: string;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
  public?: boolean = false;
  avifAutodetection?: boolean = false;
  fileSizeLimit?: bigint;
  allowedMimeTypes?: string[];
  ownerId?: string;
  objectsCollection = new Collection<Objects>(this);
  s3MultipartUploadsCollection = new Collection<S3MultipartUploads>(this);
  s3MultipartUploadsPartsCollection = new Collection<S3MultipartUploadsParts>(this);
}

export const BucketsSchema = new EntitySchema({
  class: Buckets,
  schema: "storage",
  properties: {
    id: { primary: true, type: "text" },
    name: { type: "text", unique: "bname" },
    owner: {
      type: "uuid",
      nullable: true,
      comment: "Field is deprecated, use owner_id instead",
    },
    createdAt: { type: "datetime", nullable: true, defaultRaw: `now()` },
    updatedAt: { type: "datetime", nullable: true, defaultRaw: `now()` },
    public: { type: "boolean", nullable: true },
    avifAutodetection: { type: "boolean", nullable: true },
    fileSizeLimit: { type: "bigint", nullable: true },
    allowedMimeTypes: { type: "string[]", nullable: true },
    ownerId: { type: "text", nullable: true },
    objectsCollection: { kind: "1:m", entity: () => Objects, mappedBy: "bucket" },
    s3MultipartUploadsCollection: {
      kind: "1:m",
      entity: () => S3MultipartUploads,
      mappedBy: "bucket",
    },
    s3MultipartUploadsPartsCollection: {
      kind: "1:m",
      entity: () => S3MultipartUploadsParts,
      mappedBy: "bucket",
    },
  },
});

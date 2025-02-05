import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Buckets } from './Buckets.ts';
import { S3MultipartUploads } from './S3MultipartUploads.ts';

export class S3MultipartUploadsParts extends BaseModuleEntity {
  id!: string & Opt;
  upload!: Rel<S3MultipartUploads>;
  size!: bigint & Opt;
  partNumber!: number;
  bucket!: Rel<Buckets>;
  key!: string;
  etag!: string;
  ownerId?: string;
  version!: string;
  createdAt!: Date & Opt;
}

export const S3MultipartUploadsPartsSchema = new EntitySchema({
  class: S3MultipartUploadsParts,
  tableName: 's3_multipart_uploads_parts',
  schema: 'storage',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: `gen_random_uuid()` },
    upload: {
      kind: 'm:1',
      entity: () => S3MultipartUploads,
      deleteRule: 'cascade',
    },
    size: { type: 'bigint', defaultRaw: `0` },
    partNumber: { type: 'integer' },
    bucket: { kind: 'm:1', entity: () => Buckets },
    key: { type: 'text' },
    etag: { type: 'text' },
    ownerId: { type: 'text', nullable: true },
    version: { type: 'text' },
    createdAt: { type: 'datetime', defaultRaw: `now()` },
  },
});

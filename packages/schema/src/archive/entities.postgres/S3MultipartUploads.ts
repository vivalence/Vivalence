import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Buckets } from './Buckets.ts';
import { S3MultipartUploadsParts } from './S3MultipartUploadsParts.ts';

export class S3MultipartUploads extends BaseModuleEntity {
  id!: string;
  inProgressSize!: bigint & Opt;
  uploadSignature!: string;
  bucket!: Rel<Buckets>;
  key!: string;
  version!: string;
  ownerId?: string;
  createdAt!: Date & Opt;
  s3MultipartUploadsPartsCollection = new Collection<S3MultipartUploadsParts>(this);
}

export const S3MultipartUploadsSchema = new EntitySchema({
  class: S3MultipartUploads,
  tableName: 's3_multipart_uploads',
  schema: 'storage',
  indexes: [
    {
      name: 'idx_multipart_uploads_list',
      properties: ['bucket', 'key', 'createdAt'],
    },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    inProgressSize: { type: 'bigint', defaultRaw: `0` },
    uploadSignature: { type: 'text' },
    bucket: { kind: 'm:1', entity: () => Buckets },
    key: { type: 'text' },
    version: { type: 'text' },
    ownerId: { type: 'text', nullable: true },
    createdAt: { type: 'datetime', defaultRaw: `now()` },
    s3MultipartUploadsPartsCollection: {
      kind: '1:m',
      entity: () => S3MultipartUploadsParts,
      mappedBy: 'upload',
    },
  },
});

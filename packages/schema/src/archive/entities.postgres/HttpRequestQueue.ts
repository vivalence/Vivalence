import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class HttpRequestQueue extends BaseModuleEntity {
  id!: bigint;
  method!: string;
  url!: string;
  headers!: any;
  body?: Buffer;
  timeoutMilliseconds!: number;
}

export const HttpRequestQueueSchema = new EntitySchema({
  class: HttpRequestQueue,
  schema: "net",
  properties: {
    id: { type: "bigint", autoincrement: true },
    method: { type: "text" },
    url: { type: "text" },
    headers: { type: "json" },
    body: { type: "blob", nullable: true },
    timeoutMilliseconds: { type: "integer" },
  },
});

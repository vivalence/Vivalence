import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class HttpResponse extends BaseModuleEntity {
  id?: bigint;
  statusCode?: number;
  contentType?: string;
  headers?: any;
  content?: string;
  timedOut?: boolean;
  errorMsg?: string;
  created!: Date & Opt;
}

export const HttpResponseSchema = new EntitySchema({
  class: HttpResponse,
  tableName: "_http_response",
  schema: "net",
  properties: {
    id: { type: "bigint", nullable: true },
    statusCode: { type: "integer", nullable: true },
    contentType: { type: "text", nullable: true },
    headers: { type: "json", nullable: true },
    content: { type: "text", nullable: true },
    timedOut: { type: "boolean", nullable: true },
    errorMsg: { type: "text", nullable: true },
    created: {
      type: "datetime",
      defaultRaw: `now()`,
      index: "_http_response_created_idx",
    },
  },
});

import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class Messages extends BaseModuleEntity {
  id!: bigint;
  topic!: string;
  extension!: string;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const MessagesSchema = new EntitySchema({
  class: Messages,
  schema: "realtime",
  properties: {
    id: { primary: true, type: "bigint" },
    topic: { type: "text", index: "messages_topic_index" },
    extension: { type: "text" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
  },
});

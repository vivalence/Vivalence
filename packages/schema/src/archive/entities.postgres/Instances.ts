import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class Instances extends BaseModuleEntity {
  id!: string;
  uuid?: string;
  rawBaseConfig?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const InstancesSchema = new EntitySchema({
  class: Instances,
  schema: "auth",
  comment: "Auth: Manages users across multiple sites.",
  properties: {
    id: { primary: true, type: "uuid" },
    uuid: { type: "uuid", nullable: true },
    rawBaseConfig: { type: "text", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
  },
});

import { EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";
import { InstructionEntity } from "../transient/Instruction.ts";

export enum SessionTraitsEnum {
  AGENTIC = "AGENTIC",
}

export class SessionEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  traits: SessionTraitsEnum[] & Opt = [];

  itinerary: any & Opt = {};
  history: any & Opt = {};

  strategy: string;
  instructions = new Collection<InstructionEntity>(this);
}

export const SessionSchema = new EntitySchema<SessionEntity, BaseEntity>({
  class: SessionEntity,
  extends: BaseSchema,
  tableName: "Session",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => SessionTraitsEnum,
      default: [],
    },

    instructions: { kind: "m:n", entity: () => InstructionEntity },
    strategy: { type: "string", nullable: true },
    itinerary: { type: "json" },
  },
});

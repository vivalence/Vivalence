import { BaseEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Runtime } from "../1_repo/Runtime.ts";
import { User } from "../0_root/User.ts";

// used for tag, games, tactics, and other strategic entities to track their own execution as part of an agentic-optimization strategy..
export class HEAD extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  data: any & Opt = "{}";
  // optional tactic,strategy,game,tag,dependency relations.
  // traits: [STRATEGIC]
  // relations:{
  // means that the game/strategy,dependency[entity] exports function head: which is called, and can call all kinds of runtime services, or for example, a llm.
  // uses llm for selfoptimization, or goal seeking.
  // strategicTo:{game, tag, dependency, tacitc, strategy, };
  // }
}

export const HEADSchema = new EntitySchema({
  class: HEAD,
  tableName: "HEAD",
  uniques: [
    {
      name: "HEAD_runtime_key",
      expression: 'CREATE UNIQUE INDEX "HEAD_runtime_key" ON public."HEAD" USING btree ("runtime")',
      properties: ["runtime"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    createdAt: {
      type: "datetime",
      fieldName: "createdAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: "datetime",
      fieldName: "updatedAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    user: {
      kind: "m:1",
      entity: () => User,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    runtime: {
      kind: "1:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
      unique: "HEAD_runtime_key",
    },
    data: { type: "json" },
  },
});

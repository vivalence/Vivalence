// UNCONNCECTED
import { BaseEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Runtime } from "../1_repo/Runtime.ts";
import { User } from "../0_root/User.ts";

// traits: [Agentic]
export class Session extends BaseEntity {
  id!: string;
  slug: string & Opt = "";
  version: string & Opt = "0.0.0";
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  traits?: string[];
  data: any & Opt = "{}";
}

export const SessionSchema = new EntitySchema({
  class: Session,
  tableName: "Session",
  uniques: [
    {
      name: "Session_slug_runtime_key",
      expression:
        'CREATE UNIQUE INDEX "Session_slug_runtime_key" ON public."Session" USING btree (slug, "runtime")',
      properties: ["slug", "runtime"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    slug: { type: "text" },
    version: { type: "text" },
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
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      type: "string[]",
      columnType: "SessionTraitsEnum[]",
      nullable: true,
      defaultRaw: `ARRAY[]::"SessionTraitsEnum"[]`,
    },
    data: { type: "json" },
  },
});

import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class Hooks extends BaseModuleEntity {
  id!: bigint;
  hookTableId!: number;
  hookName!: string;
  createdAt!: Date & Opt;
  requestId?: bigint;
}

export const HooksSchema = new EntitySchema({
  class: Hooks,
  schema: "supabase_functions",
  comment: "Supabase Functions Hooks: Audit trail for triggered hooks.",
  indexes: [
    {
      name: "supabase_functions_hooks_h_table_id_h_name_idx",
      properties: ["hookTableId", "hookName"],
    },
  ],
  properties: {
    id: { primary: true, type: "bigint" },
    hookTableId: { type: "integer" },
    hookName: { type: "text" },
    createdAt: { type: "datetime", defaultRaw: `now()` },
    requestId: {
      type: "bigint",
      nullable: true,
      index: "supabase_functions_hooks_request_id_idx",
    },
  },
});

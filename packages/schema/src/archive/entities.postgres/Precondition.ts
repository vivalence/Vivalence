import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { Dependency } from "./Dependency.ts";
import { PublicCondition } from "./PublicCondition.ts";

export class Precondition extends BaseModuleEntity {
  A!: Rel<PublicCondition>;
  B!: Rel<Dependency>;
}

export const PreconditionSchema = new EntitySchema({
  class: Precondition,
  tableName: "_Precondition",
  indexes: [
    {
      name: "_Precondition_B_index",
      expression:
        'CREATE INDEX "_Precondition_B_index" ON public."_Precondition" USING btree ("B")',
      properties: ["B"],
    },
  ],
  uniques: [
    {
      name: "_Precondition_AB_unique",
      expression:
        'CREATE UNIQUE INDEX "_Precondition_AB_unique" ON public."_Precondition" USING btree ("A", "B")',
      properties: ["A", "B"],
    },
  ],
  properties: {
    A: {
      kind: "m:1",
      entity: () => PublicCondition,
      fieldName: "A",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    B: {
      kind: "m:1",
      entity: () => Dependency,
      fieldName: "B",
      updateRule: "cascade",
      deleteRule: "cascade",
      index: true,
    },
  },
});

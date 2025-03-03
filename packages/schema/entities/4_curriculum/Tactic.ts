import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { PlayEntity } from "../5_userland/Play.ts";
import { InstructionEntity } from "../6_transient/Instruction.ts";

// traits: [Agentic]
export class TacticEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  plays = new Collection<PlayEntity>(this);
  instructions = new Collection<InstructionEntity>(this);

  relations: any & Opt = "{}";
  masks: any & Opt = "{}";

  get url() {
    const url = new URL(`${this.runtime.url}/tactic/${this.slug}`);
    url.modulename = `/tactic/${this.slug}`;
    return url;
  }
}

export const TacticSchema = new EntitySchema<TacticEntity, BaseModuleEntity>({
  class: TacticEntity,
  extends: BaseModuleSchema,
  tableName: "Tactic",
  // uniques: [{name: "Tactic_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Tactic_slug_runtime_key" ON public."Tactic" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.tactic },
    instructions: {
      kind: "1:m",
      entity: () => InstructionEntity,
      mappedBy: (instruction) => instruction.tactic,
    },
    relations: { type: "json" },
    masks: { type: "json" },
    url: { type: "method", persist: false, getter: true, getterName: "url" },
  },
});

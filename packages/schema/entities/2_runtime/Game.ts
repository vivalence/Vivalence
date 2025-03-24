import config from "@vivalence/config";
import { EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { PlayEntity } from "../5_userland/Play.ts";
import { InstructionEntity } from "../6_transient/Instruction.ts";

// class VivaURL extends URL {#modulename; set modulename(value) {this.#modulename = value;} get modulename() {return this.#modulename;}}

// traits: [Agentic]
export class GameEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  plays = new Collection<PlayEntity>(this);
  instructions = new Collection<InstructionEntity>(this);

  mask: any & Opt = "{}";

  get url() {
    const url = new URL(`${this.runtime.url}/game/${this.slug}`);
    url.modulename = `/game/${this.slug}`;
    return url;
  }
}

export const GameSchema = new EntitySchema<GameEntity, BaseModuleEntity>({
  class: GameEntity,
  extends: BaseModuleSchema,
  tableName: "Game",
  // uniques: [{name: "Game_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Game_slug_runtime_key" ON public."Game" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  uniques: [{ properties: ["slug", "runtime"] }],
  indexes: [],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    mask: { type: "json" },
    url: { type: "method", persist: false, getter: true, getterName: "url" },
    plays: {
      //
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.game,
    },
    instructions: {
      kind: "1:m",
      entity: () => InstructionEntity,
      mappedBy: (instruction) => instruction.game,
    },
  },
});

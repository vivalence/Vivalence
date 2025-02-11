import config from "@vivalence/config";
import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";

import { RuntimeEntity } from "../1_repo/Runtime.ts";
// class VivaURL extends URL {#modulename; set modulename(value) {this.#modulename = value;} get modulename() {return this.#modulename;}}

export class GameEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  mask: any & Opt = "{}";

  get url() {
    const url = new URL(`${this.runtime.url}/game/${this.slug}`);
    url.modulename = `/game/${this.slug}`;
    return url;
  }
  // playCollection = new Collection<Play>(this);
  // queueCollection = new Collection<Queue>(this);
}

export const GameSchema = new EntitySchema<GameEntity, BaseModuleEntity>({
  class: GameEntity,
  extends: BaseModuleSchema,
  tableName: "Game",
  // uniques: [{name: "Game_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Game_slug_runtime_key" ON public."Game" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  uniques: [{ properties: ["slug", "runtime"] }],
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
    // playCollection: { kind: "1:m", entity: () => Play, mappedBy: "game" },
    // queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "game" },
  },
});

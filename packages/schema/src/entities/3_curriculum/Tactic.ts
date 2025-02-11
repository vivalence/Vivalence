import config from "@vivalence/config";
import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";

export class TacticEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  relations: any & Opt = "{}";
  masks: any & Opt = "{}";
  get url() {
    const url = new URL(`${this.runtime.url}/tactic/${this.slug}`);
    url.modulename = `/tactic/${this.slug}`;
    return url;
  }
  // playCollection = new Collection<Play>(this);
  // queueCollection = new Collection<Queue>(this);
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
    relations: { type: "json" },
    masks: { type: "json" },
    url: { type: "method", persist: false, getter: true, getterName: "url" },
    // playCollection: { kind: "1:m", entity: () => Play, mappedBy: "tactic" },
    // queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "tactic" },
  },
});

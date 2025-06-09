import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import {
  BaseModuleEntity,
  BaseModuleSchema,
} from "../0_root/BaseModuleEntity.ts";
// import { RuntimeEntity } from "../1_repo/Runtime.ts";

export enum GameTraitsEnum {
  SHELL = "SHELL",
  BROWSER = "BROWSER",
  // AUDIO = "AUDIO",
  _ = "_",
}

export class GameEntity extends BaseModuleEntity {
  // runtime!: Rel<RuntimeEntity>;
  traits?: GameTraitsEnum[];
  data: any & Opt = "{}";
}

export const GameSchema = new EntitySchema<GameEntity, BaseModuleEntity>({
  class: GameEntity,
  tableName: "Game",
  extends: BaseModuleSchema,
  uniques: [{ properties: ["slug"] }],
  properties: {
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, updateRule: "cascade", deleteRule: "cascade",},
    traits: {
      type: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => GameTraitsEnum,
    },
    data: { type: "json" },
  },
});

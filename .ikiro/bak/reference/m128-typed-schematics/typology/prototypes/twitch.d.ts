import type { EntityManager } from "@mikro-orm/core";
import type { Entities } from "../schematics/entities/types.d.ts";
import type { contexts } from "../schematics/index.js";
import type { Signal } from "./signal.js";
import type { Die } from "./types.d.ts";
import type { Open, Vector } from "./vector.js";

export type Tense = "before" | "after";
export type Operation = "create" | "update" | "delete";

export interface Hooked<Entity> {
  entity: Entity;
  em: EntityManager;
}

export interface Hook<Held, Self> {
  <Name extends keyof Entities>(
    signature: `/${Tense}/${Name}/${Operation}`,
    effect: (die: Held & { input: Hooked<Entities[Name]> }) => unknown,
  ): Self;
}

export class Twitch<Held = Die<typeof contexts.Twitch>> extends Vector<Held> {
  open: Hook<Held, this> & Open<Held, this>;
  dispatch(signal: string | Signal, input: unknown): Promise<void>;
}

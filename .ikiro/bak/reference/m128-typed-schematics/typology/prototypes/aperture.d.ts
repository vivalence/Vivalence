import type { contexts } from "../schematics/index.js";
import type { Die } from "./types.d.ts";
import type { Open, Vector } from "./vector.js";

export class Aperture<Held = Die<typeof contexts.Aperture>> extends Vector<Held> {
  get: Open<Held, this>;
  post: Open<Held, this>;
  put: Open<Held, this>;
  patch: Open<Held, this>;
  delete: Open<Held, this>;
}

export function method<Held>(name: string, handler: (die: Held) => unknown): (die: Held) => unknown;

export function methods<Held>(
  map?: Record<string, (die: Held) => unknown>,
): ((die: Held) => unknown) & { methods: Record<string, (die: Held) => unknown> };

import type { StaticDecode } from "typebox";
import type { Aperture, Controller, Middleware, v, Vector } from "@vivalence/typology";
import type { Runtime } from "/Users/finn/vivalence/code/vivalence/systems/runtime/subjects/runtime/prototype.js";

export interface ExecutionDie {
  mask: StaticDecode<typeof v.primitives.instance.RuntimeMask>;
  aperture: Aperture;
  controller: Controller;
  runtime: Runtime;
  register?: unknown;
  traits?: Record<string, unknown>;
}

export type Next = () => Promise<unknown>;
export type Beat = Middleware<ExecutionDie>;
export type Execution = Vector<ExecutionDie>;

import type { Vector } from "@vivalence/typology";
import type { Beat, ExecutionDie } from "./types.d.ts";

export class Execution extends Vector<ExecutionDie> {}

export function beat(middleware: Beat): Beat;

import type { TObject, TOptional, TProperties } from "typebox";
import type { Schematic } from "../v.d.ts";

export function optional<Set extends TProperties>(
  set: Set,
): { [Key in keyof Set]: Schematic<TOptional<Set[Key]>> };

export function of(...sets: TProperties[]): Schematic<TObject>;

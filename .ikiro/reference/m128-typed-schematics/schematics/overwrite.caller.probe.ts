import { overwrite } from "./overwrite.held.d.ts";
import { v } from "../../../../subsystems/typology/schematics/v.js";
import { Conversational, Harnessed } from "../../../../subsystems/typology/schematics/traits/index.js";
import { Tooled } from "../../../../subsystems/typology/schematics/traits/tooled.js";
import { Primed } from "../../../../subsystems/typology/schematics/traits/primed.js";
import type { Static, StaticDecode, TSchema } from "typebox";
type IsAny<T> = 0 extends 1 & T ? true : false;
type Inside<T, Depth extends 0[] = []> = IsAny<T> extends true ? true
  : Depth["length"] extends 8 ? false
  : T extends (...args: never[]) => unknown ? false
  : T extends readonly (infer Item)[] ? Inside<Item, [...Depth, 0]>
  : T extends object ? (true extends { [Key in keyof T]: Inside<T[Key], [...Depth, 0]> }[keyof T] ? true : false)
  : false;
type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
type Where<T, At extends string = "", Depth extends 0[] = []> = IsAny<T> extends true ? `${At} any`
  : IsUnknown<T> extends true ? `${At} unknown`
  : Depth["length"] extends 8 ? never
  : T extends (...args: never[]) => unknown ? never
  : T extends readonly (infer Item)[] ? Where<Item, `${At}[]`, [...Depth, 0]>
  : T extends object
    ? { [Key in keyof T]-?: Where<Exclude<T[Key], undefined>, `${At}.${Key & string}`, [...Depth, 0]> }[keyof T]
  : never;
type Shown<T> = [T] extends [never] ? "none" : T;
type Verdict<T> = IsAny<T> extends true ? "any"
  : T extends (...args: never[]) => unknown ? "function"
  : T extends { cast: unknown; faults: unknown }
    ? (T extends TSchema
      ? (IsAny<Static<T>> extends true ? "holds any"
        : unknown extends Static<T> ? "holds unknown"
        : [Where<Static<T>>] extends [never] ? (Static<T> extends StaticDecode<T> ? "typed" : "typed, decodes")
        : Where<Static<T>>)
      : "schematic, no schema")
  : Inside<T> extends true ? "value, any inside"
  : "value";

const ModeMaskTrait = v.object(
  {
    HARNESSED: overwrite(Harnessed).optional(),
    CONVERSATIONAL: overwrite(Conversational).optional(),
    TOOLED: Tooled.optional(),
    PRIMED: Primed.optional(),
  },
);
type Held = Static<typeof ModeMaskTrait>;
export const leak: Shown<Where<Held>> = "?";
export const harmonize: NonNullable<NonNullable<Held["CONVERSATIONAL"]>["harmonize"]> = "?";
export const polish: NonNullable<NonNullable<Held["CONVERSATIONAL"]>["polish"]> = "?";
export const written: NonNullable<Static<typeof Conversational>["harmonize"]> = "?";
export const given: Held = { HARNESSED: { tier: "fast", rounds: 6 }, CONVERSATIONAL: { polish: {} } };
export const refused: Held = { HARNESSED: { tier: 6 } };

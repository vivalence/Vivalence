import type { TObject, TOptional, TProperties } from "typebox";
import type { Schematic } from "../v.d.ts";

type Overwrite<Properties extends TProperties> = {
  [Key in keyof Properties]: Properties[Key] extends TObject<infer Inner extends TProperties>
    ? TOptional<TObject<Overwrite<Inner>>>
    : TOptional<Properties[Key]>;
};

export const overwrite: <Properties extends TProperties>(
  schematic: TObject<Properties>,
) => Schematic<TObject<Overwrite<Properties>>>;

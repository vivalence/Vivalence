import type { TObject, TOptional, TProperties } from "typebox";
import type { Schematic } from "../../../../subsystems/typology/schematics/v.d.ts";
import { enhance, v } from "../../../../subsystems/typology/schematics/v.js";

type Overwritten<Properties extends TProperties> = {
  [Key in keyof Properties]: Properties[Key] extends TObject<infer Inner extends TProperties>
    ? TOptional<TObject<Overwritten<Inner>>>
    : TOptional<Properties[Key]>;
};

const bare = (schematic: object) => {
  const { default: filled, ...descriptors } = Object.getOwnPropertyDescriptors(schematic);
  return enhance(Object.defineProperties({}, descriptors));
};

export const overwrite = <Properties extends TProperties>(
  schematic: TObject<Properties>,
): Schematic<TObject<Overwritten<Properties>>> =>
  v.object(
    Object.fromEntries(
      Object.entries(schematic.properties).map(([key, property]) => [
        key,
        ("properties" in property ? overwrite(property as TObject) : bare(property)).optional(),
      ]),
    ),
    { additionalProperties: false },
  );

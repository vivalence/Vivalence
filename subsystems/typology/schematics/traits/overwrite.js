import { enhance, v } from "../v.js";

const bare = (schematic) => {
  const { default: filled, ...descriptors } = Object.getOwnPropertyDescriptors(schematic);
  return enhance(Object.defineProperties({}, descriptors));
};

export const overwrite = (schematic) =>
  v.object(
    Object.fromEntries(
      Object.entries(schematic.properties).map(([key, property]) => [
        key,
        ("properties" in property ? overwrite(property) : bare(property)).optional(),
      ]),
    ),
    { additionalProperties: false },
  );

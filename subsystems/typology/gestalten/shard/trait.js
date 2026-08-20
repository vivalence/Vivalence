import { v } from "../../schematics/v.js";

export function claimed(row, name, schema) {
  const value = row?.traits?.includes(name) ? row.trait?.[name] : undefined;
  if (!value) return {};
  if ([...v.errors(schema, value)][0]) return {};
  return v.cast(schema, value);
}

import { Type } from "@sinclair/typebox";

export const Float = Type.Number({
  description: "Floating point number",
});

export const Integer = Type.Integer({
  description: "Integer number",
});

export const Duration = Type.Integer({
  minimum: 0,
  description: "Duration in milliseconds",
});

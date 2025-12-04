import { Type } from "@sinclair/typebox";

export const Context = Type.Object(
  {},
  {
    additionalProperties: true,
    description: "Execution context with dynamic properties",
  },
);

export const Env = Type.Record(Type.String(), Type.Any(), {
  description: "Environment variables map",
});

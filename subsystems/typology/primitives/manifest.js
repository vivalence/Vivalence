import { Slug, Type } from "@vivalence/typology/scalars";

export const Manifest = Type.Object(
  {
    type: Type.String(),
    slug: Slug,
    name: Type.Optional(Type.String()),
    version: Type.Optional(Type.String()),
    traits: Type.Optional(Type.Array(Type.String())),
  },
  { description: "Module manifest" },
);

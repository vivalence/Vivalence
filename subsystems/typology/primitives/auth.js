import { ID, JWTToken, Slug, Type } from "@vivalence/typology/scalars";

export const AuthorityToken = Type.Object(
  {
    access: JWTToken,
    refresh: JWTToken,
  },
  { description: "Token pair for session management" },
);

// uniform identity locator - uil
export const IdentityReference = Type.Object(
  {
    id: ID,
    slug: Type.Optional(Slug),
    authentication: Type.Optional(Type.Null()),
  },
  { description: "daemon internal identity reference" },
);

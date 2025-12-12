import { ID, Slug, Type } from "@vivalence/typology/schematics";
import { JWTToken, Username, Password } from "@vivalence/typology/schematics";

export const AuthorityToken = Type.Object(
  {
    access: JWTToken,
    refresh: JWTToken,
  },
  { description: "Token pair for session management" },
);

export const IdentityReference = Type.Object(
  {
    id: ID,
    slug: Type.Optional(Slug),
    authentication: Type.Optional(Type.Null()),
  },
  {
    description: "daemon internal identity reference",
    // uniform identity locator - uil
  },
);

export const LoginRequest = Type.Object({
  username: Username,
  password: Password,
});

export const SignupRequest = Type.Object({
  username: Username,
  password: Password,
});

export const VerifyRequest = Type.Object({
  access: JWTToken,
});

export const RefreshRequest = Type.Object({
  refresh: JWTToken,
});

export const LogoutRequest = Type.Object({
  refresh: JWTToken,
});

// Response bodies
export const AuthResponse = Type.Object(
  {
    authority: AuthorityToken,
    identity: IdentityReference,
  },
  { description: "Login/signup success response" },
);

export const VerifyResponse = Type.Object({
  success: Type.Boolean(),
  identity: Type.Optional(IdentityReference),
});

export const RefreshResponse = Type.Object({
  access: JWTToken,
});

export const LogoutResponse = Type.Object({
  success: Type.Boolean(),
});

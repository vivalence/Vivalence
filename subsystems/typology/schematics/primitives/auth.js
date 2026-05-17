import { v } from "../v.js";
import { ID, Slug, JWTToken, Username, Password } from "../scalars/index.js";

export const AuthorityToken = v.object(
  {
    access: JWTToken,
    refresh: JWTToken,
  },
  { description: "Token pair for session management" },
);

export const IdentityReference = v.object(
  {
    id: ID,
    slug: Slug.optional(),
    authentication: v.null().optional(),
  },
  {
    description: "daemon internal identity reference",
    // uniform identity locator - uil
  },
);

export const LoginRequest = v.object({
  username: Username,
  password: Password,
});

export const SignupRequest = v.object({
  username: Username,
  password: Password,
});

export const VerifyRequest = v.object({
  access: JWTToken,
});

export const RefreshRequest = v.object({
  refresh: JWTToken,
});

export const LogoutRequest = v.object({
  refresh: JWTToken,
});

// Response bodies
export const AuthResponse = v.object(
  {
    authority: AuthorityToken,
    identity: IdentityReference,
  },
  { description: "Login/signup success response" },
);

export const VerifyResponse = v.object({
  success: v.boolean(),
  identity: IdentityReference.optional(),
});

export const RefreshResponse = v.object({
  access: JWTToken,
});

export const LogoutResponse = v.object({
  success: v.boolean(),
});

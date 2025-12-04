import { Type } from "@sinclair/typebox";
import { JWTToken, Username, Password } from "@vivalence/typology/scalars";
import {
  IdentityReference,
  AuthorityToken,
} from "@vivalence/typology/primitives";

export const LoginBody = Type.Object({
  username: Username,
  password: Password,
});

export const SignupBody = Type.Object({
  username: Username,
  password: Password,
});

export const VerifyBody = Type.Object({
  access: JWTToken,
});

export const RefreshBody = Type.Object({
  refresh: JWTToken,
});

export const LogoutBody = Type.Object({
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

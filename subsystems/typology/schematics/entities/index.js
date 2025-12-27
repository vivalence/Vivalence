// export pojo representations of system entities.

//
// LLM CONTEXT:
// import { ID, Slug, Type } from "@vivalence/typology/schematics";
// import { JWTToken, Username, Password } from "@vivalence/typology/schematics";

// export const AuthorityToken = Type.Object(
//   {
//     access: JWTToken,
//     refresh: JWTToken,
//   },
//   { description: "Token pair for session management" },
// );

// export const IdentityReference = Type.Object(
//   {
//     id: ID,
//     slug: Type.Optional(Slug),
//     authentication: Type.Optional(Type.Null()),
//   },
//   {
//     description: "daemon internal identity reference",
//     // uniform identity locator - uil
//   },
// );

// export const LoginRequest = Type.Object({
//   username: Username,
//   password: Password,
// });

// export const SignupRequest = Type.Object({
//   username: Username,
//   password: Password,
// });

// export const VerifyRequest = Type.Object({
//   access: JWTToken,
// });

// export const RefreshRequest = Type.Object({
//   refresh: JWTToken,
// });

// export const LogoutRequest = Type.Object({
//   refresh: JWTToken,
// });

// // Response bodies
// export const AuthResponse = Type.Object(
//   {
//     authority: AuthorityToken,
//     identity: IdentityReference,
//   },
//   { description: "Login/signup success response" },
// );

// export const VerifyResponse = Type.Object({
//   success: Type.Boolean(),
//   identity: Type.Optional(IdentityReference),
// });

// export const RefreshResponse = Type.Object({
//   access: JWTToken,
// });

// export const LogoutResponse = Type.Object({
//   success: Type.Boolean(),
// });
// import { Type } from "@sinclair/typebox";

// const StatusCode = Type.Union(
//   [
//     Type.Literal("IDLE"),
//     Type.Literal("HEALTHY"),
//     Type.Literal("PENDING"),
//     Type.Literal("ACTIVE"),
//     Type.Literal("SUCCESS"),
//     Type.Literal("ERROR"),
//     Type.Literal("INTERRUPTED"),
//   ],
//   {
//     description: "Machine-readable status code",
//   },
// );

// const StatusError = Type.Object(
//   {
//     name: Type.String(),
//     message: Type.String(),
//     code: Type.Optional(Type.String()),
//     stack: Type.Optional(Type.String()),
//   },
//   { description: "Error details when code is ERROR" },
// );

// export const Status = Type.Object(
//   {
//     code: StatusCode,
//     // message: Type.Optional(Type.String()),
//     error: Type.Optional(StatusError),

//     label: Type.Optional(
//       Type.String({
//         description: "Human-readable status description",
//       }),
//     ),

//     timestamp: Type.Optional(
//       Type.String({
//         format: "date-time",
//         description: "When this status was set",
//       }),
//     ),
//   },
//   {
//     description: "System status representation",
//   },
// );

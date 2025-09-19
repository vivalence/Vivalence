import { Type } from "@sinclair/typebox";
import { URL } from "./url.js";
import { Status } from "./status.js";

const ConnectionState = Type.Union(
  [
    //
    Type.Literal("UNRESOLVED"),
    Type.Literal("HEALTHY"),
    Type.Literal("FAULTY"),
  ],
  {
    description: "Connection state",
  },
);

const ConnectionError = Type.Union([
  // any error
  Type.Object({
    code: Type.String(),
    message: Type.String(),
  }),
  Type.Null(),
]);

export const Connection = Type.Object(
  {
    url: URL,
    status: Status,
    state: ConnectionState,
    error: Type.Optional(ConnectionError),
  },
  {
    description: "Network connection representation",
  },
);

// import { Type } from "@sinclair/typebox";
// import { URL } from "./url.js";
// import { Status } from "./status.js";

// export const ConnectionState = Type.Union(
//   [Type.Literal("UNRESOLVED"), Type.Literal("HEALTHY"), Type.Literal("ERROR")],
//   {
//     description: "Connection state",
//   },
// );

// const ConnectionError = Type.Union();

// export const Connection = Type.Object(
//   {
//     url: URL,
//     state: ConnectionState,
//     status: Status,
//     error: ConnectionError,
//   },
//   {
//     description: "Network connection representation",
//   },
// );

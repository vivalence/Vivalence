import { Type } from "@sinclair/typebox";

const StatusCode = Type.Union(
  [
    Type.Literal("IDLE"),
    Type.Literal("PENDING"),
    Type.Literal("ACTIVE"),
    Type.Literal("SUCCESS"),
    Type.Literal("ERROR"),
    Type.Literal("INTERRUPTED"),
  ],
  {
    description: "Machine-readable status code",
  },
);

const StatusError = Type.Object(
  {
    name: Type.String(),
    message: Type.String(),
    code: Type.Optional(Type.String()),
    stack: Type.Optional(Type.String()),
  },
  { description: "Error details when code is ERROR" },
);

export const Status = Type.Object(
  {
    code: StatusCode,
    // message: Type.Optional(Type.String()),
    error: Type.Optional(StatusError),

    label: Type.Optional(
      Type.String({
        description: "Human-readable status description",
      }),
    ),

    timestamp: Type.Optional(
      Type.String({
        format: "date-time",
        description: "When this status was set",
      }),
    ),
  },
  {
    description: "System status representation",
  },
);

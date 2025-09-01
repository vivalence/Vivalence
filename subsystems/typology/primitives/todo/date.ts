import { Type } from "@sinclair/typebox";

export const DateTime = Type.String({
  format: "date-time",
  description: "ISO 8601 date-time string",
});

export const TimeRange = Type.Object(
  {
    start: DateTime,
    end: DateTime,
  },
  {
    description: "Time range with start and end",
  },
);

export const DateRange = Type.Object(
  {
    start: Type.String({ format: "date" }),
    end: Type.String({ format: "date" }),
  },
  {
    description: "Date range with start and end",
  },
);

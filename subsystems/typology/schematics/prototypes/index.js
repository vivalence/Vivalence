import { v } from "../lib.js";
import { Timestamp } from "../scalars/index.js";

export const StatusCode = v.union([
  v.const("IDLE"),
  v.const("HEALTHY"),
  v.const("PENDING"),
  v.const("ACTIVE"),
  v.const("SUCCESS"),
  v.const("ERROR"),
]);

export const Status = v.object({
  timestamp: Timestamp,
  code: v.string().optional(),
});

export const ErrorResponse = v.object({
  success: v.const(false),
  message: v.string().optional(),
  error: v.any().optional(),
});

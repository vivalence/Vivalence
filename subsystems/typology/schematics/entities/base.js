import { v } from "../lib.js";
import { ID, Timestamp } from "../scalars/index.js";

export const BaseEntitySchema = v.object({
  id: ID.optional(),
  createdAt: Timestamp.optional(),
  updatedAt: Timestamp.optional(),
}, { $id: "BaseEntity", additionalProperties: true });

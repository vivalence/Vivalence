import { v } from "../v.js";
import { ID, Timestamp } from "../scalars/index.js";

export const DataEntitySchema = v.object({
  id: ID.optional(),
  createdAt: Timestamp.optional(),
  updatedAt: Timestamp.optional(),
}, { $id: "DataEntity", additionalProperties: true });

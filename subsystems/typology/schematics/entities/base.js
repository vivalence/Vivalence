import { v } from "../v.js";
import { ID, Timestamp } from "../scalars/index.js";

export const DataEntitySchema = v.object({
  id: ID.optional(),
  createdAt: Timestamp.optional(),
  updatedAt: Timestamp.optional(),
}, { $id: "DataEntity", additionalProperties: true });

// appended beside DataEntitySchema — an id and a birth, no updatedAt (nothing is ever re-read from a store)
export const VirtualEntitySchema = v.object({
  id: v.string().desc("Minted in the constructor, never a primary key — mikro forbids one on a virtual entity. Example: \"019d23f1-8c4e-7a2b-9f10-3e5a1c2d4b6f\""),
  createdAt: v.string().desc("ISO birth of the instance; dies with the process. Example: \"2026-09-14T10:00:00.000Z\""),
}, { additionalProperties: true });

import { v } from "../v.js";
import { ID, Timestamp } from "../scalars/index.js";

export const DataEntitySchema = v.object({
  id: ID.optional().examples("01a09010-13aa-778b-bce7-19c38f835337"),
  createdAt: Timestamp.optional().examples("2026-11-09T16:11:21.476Z"),
  updatedAt: Timestamp.optional().examples("2026-11-09T16:14:02.118Z"),
}, { $id: "DataEntity", additionalProperties: true });

export const VirtualEntitySchema = v.object({
  id: v.string().desc("Minted in the constructor, never a primary key — mikro forbids one on a virtual entity").examples("019d23f1-8c4e-7a2b-9f10-3e5a1c2d4b6f"),
  createdAt: v.string().desc("ISO birth of the instance; dies with the process").examples("2026-09-14T10:00:00.000Z"),
}, { additionalProperties: true });

export const DataSchematic = { base: DataEntitySchema };
export const VirtualSchematic = { base: VirtualEntitySchema };

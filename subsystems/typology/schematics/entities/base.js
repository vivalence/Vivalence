import { v } from "../v.js";
import { ID } from "../scalars/index.js";

export const DataEntitySchema = v.object({
  id: ID.optional().example("01a09010-13aa-778b-bce7-19c38f835337"),
  createdAt: v.instant().optional().example("2026-11-09T16:11:21.476Z"),
  updatedAt: v.instant().optional().example("2026-11-09T16:14:02.118Z"),
}, { $id: "DataEntity", additionalProperties: true });

export const VirtualEntitySchema = v.object({
  id: v.string().desc("Minted in the constructor, never a primary key — mikro forbids one on a virtual entity").example("019d23f1-8c4e-7a2b-9f10-3e5a1c2d4b6f"),
  createdAt: v.instant().desc("ISO birth of the instance; dies with the process").example("2026-09-14T10:00:00.000Z"),
}, { additionalProperties: true });

export const DataSchematic = { base: DataEntitySchema };
export const VirtualSchematic = { base: VirtualEntitySchema };

import { Type, ID, Timestamp } from "../scalars/index.js";

export const BaseEntitySchema = Type.Object({
  id: Type.Optional(ID),
  createdAt: Type.Optional(Timestamp),
  updatedAt: Type.Optional(Timestamp),
}, { $id: "BaseEntity", additionalProperties: true });

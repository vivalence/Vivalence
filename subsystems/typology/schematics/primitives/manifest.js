import { v } from "../v.js";
import { Slug } from "../scalars/index.js";

export const Manifest = v.object(
  {
    type: v.string(),
    slug: Slug,
    owner: v.string().optional(),
    version: v.string().optional(),
    name: v.string().optional(),
    description: v.string().optional(),
    traits: v.array(v.string()).optional(),
  },
  { additionalProperties: true },
);

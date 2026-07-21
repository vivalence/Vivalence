import { v } from "../index.js";

export const Bundle = () =>
  v.object({
    entries: v.array(
      v.object({
        type: v.string(),
        mount: v.string(),
        integrity: v.string().optional(),
        bytes: v.integer(),
      }),
      { minItems: 1 },
    ),
  });

export const View = () =>
  v.object({
    kind: v.string(),
    hash: v.string().optional(),
    mount: v.string(),
    bundle: Bundle(),
  });

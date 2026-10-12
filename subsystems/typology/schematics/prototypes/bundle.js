import { v } from "../v.js";
import { type } from "../scalars/mime.js";

export const Bundle = () =>
  v.object({
    entries: v.array(
      v.object({
        mime: type(),
        hash: v.string(),
        mount: v.string(),
        integrity: v.string(),
        bytes: v.integer(),
      }),
      { minItems: 1 },
    ),
  });

import { v } from "../v.js";
import { Bytes, Hash, Integrity } from "../scalars/index.js";
import { type } from "../scalars/mime.js";

export const Bundle = v.object({
    entries: v.array(
      v.object({
        mime: type(),
        hash: Hash,
        mount: v.string(),
        integrity: Integrity,
        bytes: Bytes,
      }),
      { minItems: 1 },
    ),
  });

import { v } from "../v.js";
import { Manifest } from "./manifest.js";

// Export contract for a kernel module (domain/ontology/corpus).
// additionalProperties keeps the live `aperture` member untouched by cast.
export const Domain = v.object(
  {
    manifest: Manifest.optional(),
    traits:   v.record(v.string(), v.unknown()).default({}),
    kinds:    v.record(v.string(), v.unknown()).default({}),
    entities: v.record(v.string(), v.unknown()).default({}),
  },
  { additionalProperties: true },
);

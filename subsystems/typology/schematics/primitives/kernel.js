import { v } from "../v.js";
import { Manifest } from "./manifest.js";

// Export contract for a kernel module (domain/topology/topography).
// additionalProperties keeps the live `aperture` member untouched by cast.
// schematics: the domain's shapes under one key — a mode reaches them as daemon.domain.schematics.X.
export const Domain = v.object(
  {
    manifest:   Manifest.optional(),
    traits:     v.record(v.string(), v.unknown()).default({}),
    entities:   v.record(v.string(), v.unknown()).default({}),
    schematics: v.record(v.string(), v.unknown()).default({}),
  },
  { additionalProperties: true },
);

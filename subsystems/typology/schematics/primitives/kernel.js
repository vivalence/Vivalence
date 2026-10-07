import { v } from "../v.js";
import { Manifest } from "./manifest.js";

// Export contract for a kernel module (domain/topology/topography).
// additionalProperties keeps the live `aperture` member untouched by cast.
// schematics: the domain's shapes under one key — a mode reaches them as daemon.domain.schematics.X.
export const Domain = v.object(
  {
    manifest:   Manifest.optional(),
    traits:     v.object({ literal: v.array(v.unknown()).default([]), symbol: v.array(v.unknown()).default([]), note: v.array(v.unknown()).default([]), mode: v.array(v.unknown()).default([]) }).default({}),
    twitch:     v.unknown().optional(),
    schematics: v.record(v.string(), v.unknown()).default({}),
  },
  { additionalProperties: true },
);

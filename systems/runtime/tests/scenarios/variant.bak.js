// The scenario entity variant — the SAME tiered, type-keyed merge the runtime
// builds in daemon/lifecycle/population.js (`die.variant.entities`). Base tiers
// (abstract) → domain concretes (win). The domain concretizes literal/symbol/
// buffer, so the runtime's slim-daemon concrete defaults are shadowed here and
// omitted. Memory + Trace ride in via the domain set; no scenario-local copies.
import { sets } from "@vivalence/typology/entities";
import { entities as domain } from "../../../../registry/education/domain/learning/entities/index.js";

export const tiers = {
  ...sets.daemon,
  ...sets.kernel,
  ...sets.userspace,
  ...domain,
};

// variant(extra) → descriptor array for provider(). `extra` overrides by type.
export const variant = (extra = {}) => Object.values({ ...tiers, ...extra });

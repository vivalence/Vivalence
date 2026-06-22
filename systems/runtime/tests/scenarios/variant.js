// The scenario entity variant — the SAME tiered, type-keyed merge the runtime
// builds in daemon/lifecycle/population.js (`die.variant.entities`). Base tiers
// (abstract, shadowed) → daemon-default concretes → domain concretes (win).
// Memory + Trace ride in via the domain set; no scenario-local entity copies.
import { sets } from "@vivalence/typology/entities";
import { entities as defaults } from "../../daemon/entities.js";
import { entities as domain } from "../../../../registry/kernels/@vivalence/domain/learning/entities/index.js";

export const tiers = {
  ...sets.daemon,
  ...sets.kernel,
  ...sets.userspace,
  ...defaults,
  ...domain,
};

// variant(extra) → descriptor array for provider(). `extra` overrides by type.
export const variant = (extra = {}) => Object.values({ ...tiers, ...extra });

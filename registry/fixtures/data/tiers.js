import { sets } from "@vivalence/runtime";
import { entities as domain } from "../../education/domain/entities/index.js";

export const stack = [sets.daemon, sets.kernel, sets.userspace, domain];

export const tiers = {
  ...sets.daemon,
  ...sets.kernel,
  ...sets.userspace,
  ...domain,
};

export const variant = (extra = {}) => Object.values({ ...tiers, ...extra });

import { sets } from "@vivalence/runtime";

export const stack = [sets.identity, sets.composition, sets.kernel, sets.userspace, sets.transient];

export const tiers = {
  ...sets.identity,
  ...sets.composition,
  ...sets.kernel,
  ...sets.userspace,
  ...sets.transient,
};

export const instance = (extra = {}) => Object.values({ ...tiers, ...extra });

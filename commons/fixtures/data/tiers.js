import { sets } from "@vivalence/runtime";
import { entities as domain } from "../language-learning/entities/index.js";

export const stack = [sets.kernel, sets.userspace, sets.transient, domain];

export const tiers = {
  ...sets.kernel,
  ...sets.userspace,
  ...sets.transient,
  ...domain,
};

export const instance = (extra = {}) => Object.values({ ...tiers, ...extra });

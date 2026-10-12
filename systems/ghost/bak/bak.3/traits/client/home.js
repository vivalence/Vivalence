import { is, traits, v } from "@vivalence/typology";

const vocabulary = { HOME: v.primitives.Home };

export const reference = (client) => {
  const held = [client.runtime.lighthouse.user, client.mask].map((row) => traits.claim(row, "HOME", vocabulary)).find((home) => is.string(home.reference));
  return held === undefined ? null : held.reference;
};

import from from "./lib/from.js";

export default async function fromUnits({ scope, mask, units }, ctx) {
  return await from({ scope, mask, units });
}

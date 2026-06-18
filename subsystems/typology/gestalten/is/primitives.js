import * as is from "./scalars.js";

export function product(thing) {
  return is.object(thing.data) && is.object(thing.scope);
}

export function lookup(thing) {
  return is.object(thing) && thing.type && thing.slug && thing.owner;
}

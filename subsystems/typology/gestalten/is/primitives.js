import * as is from "./scalars.js";

export function labeled(thing) {
  return is.object(thing) && is.string(thing.name);
}

export function product(thing) {
  return is.object(thing.data) && is.object(thing.scope);
}

export function lookup(thing) {
  return is.object(thing) && thing.type && thing.slug && thing.owner;
}

// high level question is the level of assertion/guarantee is ought to provide.
// convention: Uppercase=instanceof,lowercase=satisfiesconstraints/castable
// lowercase is just says that if something smells like a duck, farts like a duck, and quacks like a duck, it might taste like one too.
// uppercase is a fasho.
// limit cases like signature evolve.

import { Vector as VP } from "@vivalence/vector";
import { prototypes } from "@vivalence/typology";
import * as is from "./primitives.js";

export function lookup(thing) {
  return is.object(thing) && thing.type && thing.slug && thing.owner;
}

export function Signature(thing) {
  return thing instanceof prototypes.Signature;
}
export function signature(thing) {
  return is.object(thing) && is.defined(thing.signature);
}
export function Pattern(thing) {
  return thing instanceof prototypes.Pattern;
}

export function pattern(thing) {
  return (
    is.defined(thing) &&
    !is.array(thing) &&
    is.fn(thing.filter) &&
    is.defined(thing.signature)
  );
}

export function Signal(thing) {
  return thing instanceof prototypes.Signal;
}

export function signal(thing) {
  return is.defined(thing?.signature);
}

export function Path(thing) {
  return thing instanceof prototypes.Path;
}
export const path = Path;

export function vector(thing) {
  return (
    signature(thing) &&
    is.object(thing) &&
    is.defined(thing.effects) &&
    is.defined(thing.trajectories) &&
    is.defined(thing.carry) &&
    is.fn(thing.use) &&
    is.fn(thing.branch) &&
    is.fn(thing.open)
  );
}

export function Vector(thing) {
  return thing instanceof VP;
}

export function Aperture(thing) {
  return thing.constructor.name === "Aperture";
}

export function View(thing) {
  return thing.constructor.name === "View";
  // return thing instanceof View;
}

// high level question is the level of assertion/guarantee is ought to provide.
// convention: Uppercase=instanceof,lowercase=satisfiesconstraints/castable
// lowercase is just says that if something smells like a duck, farts like a duck, and quacks like a duck, it might taste like one too.
// uppercase is a fasho.
// limit cases like signature evolve.

import { prototypes } from "@vivalence/typology";
import * as is from "./scalars.js";
import { Vector as VP } from "@vivalence/typology";

export function Signature(thing) {
  return thing instanceof prototypes.Signature;
}
export function signature(thing) {
  return is.object(thing) && is.defined(thing.nature);
}
export function Pattern(thing) {
  return thing instanceof prototypes.Pattern;
}

export const Action = (thing) => thing?.constructor?.name === "Action" || thing instanceof Action;

export const action = Action;

export function pattern(thing) {
  return is.defined(thing) && !is.array(thing) && is.fn(thing.filter) && is.defined(thing.nature);
}

export function Signal(thing) {
  return thing instanceof prototypes.Signal;
}

export function signal(thing) {
  return is.defined(thing?.nature);
}

export function Path(thing) {
  return thing instanceof prototypes.Path;
}
export const path = Path; // ! true; but complicated

export function FilePath(thing) {
  return thing instanceof prototypes.FilePath;
}
export const filepath = FilePath;

export function vector(thing) {
  return (
    signature(thing) &&
    is.object(thing) &&
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

export function App(thing) {
  return thing.constructor.name === "App";
  // return thing instanceof App;
}

export function yieldish(thing) {
  // @beef. technically wrong-ish and incomplete.
  return is.object(thing) && is.string(thing.condition) && is.object(thing.entities);
}

export function buffers(thing) {
  const buffer = (item) => item?.constructor?.name === "BufferEntity";
  return buffer(thing) || (is.array(thing) && thing.every(buffer));
}

export function url(thing) {
  if (is.string(thing)) return thing.includes("://");
  if (thing && thing.origin && (thing.pathname || thing.nature)) return true;
  return false;
}

// framling(thing){} utlanning(thing){}

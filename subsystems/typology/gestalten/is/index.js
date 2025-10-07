// convention: Uppercase=instanceof,lowercase=satisfiesconstraints/castable
import { is } from "@vivalence/shared";
import { Vector as VP } from "@vivalence/vector";
import { prototypes } from "@vivalence/typology";

// export function signature(thing) {return (is.string(thing.hash) && is.fn(thing.filter) && is.defined(thing.signature));}

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
  return !is.array(thing) && is.fn(thing.filter) && is.defined(thing.signature);
}
export function Signal(thing) {
  return thing instanceof prototypes.Signal;
}
export function signal(thing) {
  return is.defined(signal?.signature);
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

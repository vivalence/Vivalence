// convention: Uppercase=instanceof,lowercase=satisfiesconstraints/castable
export function array(thing) {
  return Array.isArray(thing);
}

export function object(thing) {
  return (
    typeof thing === "object" &&
    thing !== null &&
    !Array.isArray(thing) &&
    !(thing instanceof Map) &&
    !(thing instanceof Set)
  );
}

export function fn(thing) {
  return typeof thing === "function";
}

export function string(thing) {
  return typeof thing === "string";
}

export function number(thing) {
  return typeof thing === "number" && !isNaN(thing);
}

export function numberPositive(thing) {
  return typeof number(thing) && thing > 0;
}

export function boolean(thing) {
  return typeof thing === "boolean";
}

export function undefined(thing) {
  return typeof thing === "undefined";
}

export function nill(thing) {
  return thing === null;
}

export function defined(thing) {
  return !!thing && thing !== undefined && thing !== null;
}

export function empty(thing) {
  if (string(thing) || array(thing)) return thing.length === 0;
  if (object(thing)) return Object.keys(thing).length === 0;
  console.log("is.empty(thing) wrong thing", thing, !!thing);
  return !!thing;
}

export function integer(thing) {
  return number(thing) && Number.isInteger(thing);
}

export function positive(thing) {
  return number(thing) && thing > 0;
}

export function negative(thing) {
  return number(thing) && thing < 0;
}

export function email(thing) {
  if (!string(thing)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(thing);
}

export function date(thing) {
  return thing instanceof Date && !isNaN(thing.getTime());
}

export function regex(thing) {
  return thing instanceof RegExp;
}

export function promise(thing) {
  return thing instanceof Promise || (object(thing) && fn(thing.then));
}

export function error(thing) {
  return thing instanceof Error;
}

export function module(thing) {
  // js in a nutshell
  return object(thing);
}

export function id(thing) {
  if (!string(thing)) return false;
  if (thing.length !== 36 && thing.length !== 32) return false;
  return /^[0-9A-Fa-f-]+$/.test(thing);
}

export function slug(thing) {
  if (!string(thing)) return false;
  if (thing.length < 1 || thing.length > 200) return false;
  return /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(thing);
}

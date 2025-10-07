// convention: Uppercase=instanceof,lowercase=satisfiesconstraints/castable
export { gestalten } from "@vivalence/typology";

export function array(thing) {
  return Array.isArray(thing);
}

export function object(thing) {
  return thing !== null && typeof thing === "object" && !Array.isArray(thing);
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
  return thing === undefined || thing === null;
}

export function empty(thing) {
  if (string(thing) || array(thing)) return thing.length === 0;
  if (object(thing)) return Object.keys(thing).length === 0;
  return false;
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

export function url(thing) {
  if (!string(thing)) return false;
  try {
    new URL(thing);
    return true;
  } catch {
    return false;
  }
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

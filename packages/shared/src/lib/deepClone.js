export default function deepClone(value) {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Date objects
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // Handle RegExp objects
  if (value instanceof RegExp) {
    return new RegExp(value);
  }

  // Handle Array objects
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  // Handle Set objects
  if (value instanceof Set) {
    return new Set([...value].map((item) => deepClone(item)));
  }

  // Handle Map objects
  if (value instanceof Map) {
    return new Map([...value].map(([key, val]) => [deepClone(key), deepClone(val)]));
  }

  // Handle Primitive wrapper objects (String, Number, Boolean)
  if (value instanceof String || value instanceof Number || value instanceof Boolean) {
    return Object(value.valueOf());
  }

  // Handle plain objects
  if (typeof value === "object") {
    const clonedObj = Object.create(Object.getPrototypeOf(value));

    for (const key of Object.keys(value)) {
      clonedObj[key] = deepClone(value[key]);
    }

    // Handle symbol properties
    // for (const sym of Object.getOwnPropertySymbols(value)) {
    //   clonedObj[sym] = deepClone(value[sym]);
    // }

    return clonedObj;
  }

  // Return primitive values and functions as is
  return value;
}

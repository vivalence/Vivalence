import { is } from "@vivalence/typology";

export function entries(obj) {
  console.trace("legacy call to shared.obj.entries");
  return Object.fromEntries(obj);
}

export function values(obj) {
  return Object.values(obj);
}

export function isEmpty(thing) {
  console.trace("legacy call to shared.obj.isentry");
  return is.empty(thing);
}

export function clone(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    return new RegExp(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => clone(item));
  }

  if (value instanceof Set) {
    return new Set([...value].map((item) => clone(item)));
  }

  if (value instanceof Map) {
    return new Map([...value].map(([key, val]) => [clone(key), clone(val)]));
  }

  if (
    value instanceof String ||
    value instanceof Number ||
    value instanceof Boolean
  ) {
    return Object(value.valueOf());
  }

  if (typeof value === "object") {
    const clonedObj = Object.create(Object.getPrototypeOf(value));

    for (const key of Object.keys(value)) {
      clonedObj[key] = clone(value[key]);
    }

    return clonedObj;
  }

  return value;
}

export function stripNulls(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === null) {
        obj.splice(i, 1);
      } else {
        stripNulls(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (obj[key] === null) {
      delete obj[key];
    } else {
      stripNulls(obj[key]);
    }
  }

  return obj;
}

export function equals(obj1, obj2) {
  return Object.is(JSON.stringify(obj1), JSON.stringify(obj2));
}

export function merge(...objects) {
  const isObj = (obj) => obj && typeof obj === "object";

  return objects.reduce(
    (prev, obj) => {
      if (obj === undefined || obj === null || typeof obj !== "object")
        return prev;

      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(oVal)) {
          prev[key] = is.array(pVal)
            ? oVal
            : array
                .unique([...pVal, ...oVal].map((v) => JSON.stringify(v)))
                .map((v) => JSON.parse(v));
        } else if (is.object(oVal)) {
          prev[key] = is.object(pVal) ? merge(pVal, oVal) : oVal;
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    is.array(objects[0]) ? [] : {},
  );
}

export function strip(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === null) {
        obj.splice(i, 1);
      } else {
        stripNullsInPlace(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (obj[key] === null) {
      delete obj[key];
    } else {
      stripNullsInPlace(obj[key]);
    }
  }

  return obj;
}

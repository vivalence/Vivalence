import { is } from "@vivalence/typology";

export function omit(obj, keys) {
  if (!is.object(obj)) return obj;
  const [shallow, nested] = keys.reduce(
    ([s, n], k) => (k.includes(".") ? [s, [...n, k]] : [[...s, k], n]),
    [[], []],
  );
  const result = Object.fromEntries(Object.entries(obj).filter(([k]) => !shallow.includes(k)));
  for (const path of nested) {
    const [head, ...rest] = path.split(".");
    if (head in result && is.object(result[head]))
      result[head] = omit(result[head], [rest.join(".")]);
  }
  return result;
}

export function pick(obj, keys) {
  if (!is.object(obj)) return obj;
  const [shallow, nested] = keys.reduce(
    ([s, n], k) => (k.includes(".") ? [s, [...n, k]] : [[...s, k], n]),
    [[], []],
  );
  const result = Object.fromEntries(Object.entries(obj).filter(([k]) => shallow.includes(k)));
  for (const path of nested) {
    const [head, ...rest] = path.split(".");
    if (head in obj && is.object(obj[head])) result[head] = pick(obj[head], [rest.join(".")]);
  }
  return result;
}

export const match = (obj, pattern) =>
  Object.entries(pattern).every(([k, v]) =>
    is.object(v) && is.object(obj[k])
      ? match(obj[k], v)
      : is.array(v)
        ? is.array(obj[k]) && v.every((item) => obj[k].includes(item))
        : obj[k] === v,
  );

export function strip(obj) {
  if (!is.object(obj)) return obj;

  if (is.array(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === null) {
        obj.splice(i, 1);
      } else {
        strip(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (obj[key] === null) {
      delete obj[key];
    } else {
      strip(obj[key]);
    }
  }

  return obj;
}

export const stripNulls = strip;

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

  if (is.array(value)) {
    return value.map((item) => clone(item));
  }

  if (value instanceof Set) {
    return new Set([...value].map((item) => clone(item)));
  }

  if (value instanceof Map) {
    return new Map([...value].map(([key, val]) => [clone(key), clone(val)]));
  }

  if (value instanceof String || value instanceof Number || value instanceof Boolean) {
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

export function equals(obj1, obj2) {
  return Object.is(JSON.stringify(obj1), JSON.stringify(obj2));
}

// export function merge(...objects) {const isObj = (obj) => obj && typeof obj === "object"; return objects.reduce((prev, obj) => {if (obj === undefined || obj === null || typeof obj !== "object") return prev; Object.keys(obj).forEach((key) => {const pVal = prev[key]; const oVal = obj[key]; if (Array.isArray(oVal)) {prev[key] = is.array(pVal) ? oVal : array.unique([...pVal, ...oVal]} else if (is.object(oVal)) {prev[key] = is.object(pVal) ? merge(pVal, oVal) : oVal;} else {prev[key] = oVal;}}); return prev;}, is.array(objects[0]) ? [] : {},);}

const deepMergeCore = (current, options, visited, ...sources) => {
  if (!sources.length) return current;
  const source = sources.shift();

  if (source === undefined || source === null) {
    return deepMergeCore(current, options, visited, ...sources);
  }

  if (is.object(source)) {
    if (visited.has(source)) return visited.get(source);
    visited.set(source, current);

    for (const key in source) {
      const sourceValue = source[key];
      const customFn = options.customMergeFunctions?.[sourceValue?.constructor?.name];

      if (sourceValue && customFn) {
        current[key] = customFn(current[key], sourceValue);
      } else if (sourceValue instanceof Map) {
        current[key] =
          options.mapMergeStrategy === "replace"
            ? new Map(sourceValue)
            : new Map([...(current[key] || []), ...sourceValue]);
      } else if (sourceValue instanceof Set) {
        current[key] =
          options.setMergeStrategy === "replace"
            ? new Set(sourceValue)
            : new Set([...(current[key] || []), ...sourceValue]);
      } else if (is.array(sourceValue)) {
        current[key] =
          options.arrayMergeStrategy === "unique"
            ? [...new Set([...(current[key] || []), ...sourceValue])]
            : options.arrayMergeStrategy === "replace"
              ? sourceValue
              : [...(current[key] || []), ...sourceValue];
      } else if (sourceValue instanceof Date) {
        if (!(current[key] instanceof Date)) {
          current[key] = sourceValue;
        } else {
          const t = current[key].getTime();
          const s = sourceValue.getTime();
          current[key] =
            options.dateMergeStrategy === "keepEarlier"
              ? t < s
                ? current[key]
                : sourceValue
              : options.dateMergeStrategy === "keepLater"
                ? t > s
                  ? current[key]
                  : sourceValue
                : sourceValue;
        }
      } else if (is.object(sourceValue)) {
        current[key] = deepMergeCore(current[key] || {}, options, visited, sourceValue);
      } else {
        current[key] = sourceValue;
      }
    }
  } else {
    return source;
  }

  return deepMergeCore(current, options, visited, ...sources);
};

// export const merge = (...sources) => deepMergeCore({}, {}, new WeakMap(), ...sources);

export const merge = (...sources) =>
  deepMergeCore({}, { arrayMergeStrategy: "unique" }, new WeakMap(), ...sources);

merge.withOptions = (options, ...sources) => deepMergeCore({}, options, new WeakMap(), ...sources);

export function values(obj) {
  return Object.values(obj);
}

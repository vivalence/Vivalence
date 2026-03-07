export const deep = (val, seen = new WeakSet()) => {
  if (typeof val !== "object" || val === null) return val;
  if (seen.has(val)) return undefined;
  seen.add(val);
  if (Array.isArray(val)) return val.map((v) => deep(v, seen));
  return Object.keys(val)
    .sort()
    .reduce((acc, k) => {
      acc[k] = deep(val[k], seen);
      return acc;
    }, {});
};

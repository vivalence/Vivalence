const atomic = (value) =>
  typeof value.get === "function" && typeof value.listen === "function" && typeof value.subscribe === "function" && "lc" in value;

const getters = (value) => {
  const names = [];
  for (let proto = Object.getPrototypeOf(value); proto !== null && proto !== Object.prototype; proto = Object.getPrototypeOf(proto))
    for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto)))
      if (descriptor.get !== undefined && !names.includes(name)) names.push(name);
  return names;
};

const quoted = (key) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key));

export const form = (value, depth = 2, { pad = "", seen = new Set(), limit = 240, items = 24, getting = true } = {}) => {
  const next = (held, room = depth - 1) => form(held, room, { pad: `${pad}  `, seen, limit, items, getting });
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return JSON.stringify(value.length > limit ? `${value.slice(0, limit)}…(+${value.length - limit} chars)` : value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return `ƒ ${value.name || "anonymous"}`;
  if (typeof value === "symbol") return value.toString();
  if (seen.has(value)) return `[Circular ${value.constructor?.name ?? "Object"}${value.id ? ` ${value.id}` : ""}]`;
  if (atomic(value)) {
    let held;
    try { held = value.get(); } catch (error) { held = `‹get threw ${error.message}›`; }
    return `atom(${next(held, depth)})`;
  }
  if (value instanceof Promise) return "Promise";
  const name = value.constructor?.name ?? "Object";
  const head = Array.isArray(value) ? "" : name === "Object" ? "" : `${name} `;
  if (depth < 0) return Array.isArray(value) ? `[…${value.length}]` : `${head}{…${Object.keys(value).length} keys}`;
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const shown = value.slice(0, items).map((held) => `${pad}  ${next(held)}`);
      if (value.length > items) shown.push(`${pad}  …(+${value.length - items})`);
      return `[\n${shown.join(",\n")}\n${pad}]`;
    }
    if (value instanceof Map) return `Map(${value.size}) [${[...value.keys()].slice(0, items).map((key) => (typeof key === "string" ? JSON.stringify(key) : form(key, 0))).join(", ")}]`;
    if (value instanceof Set) return `Set(${value.size})`;
    const rows = Object.keys(value).map((key) => `${pad}  ${quoted(key)}: ${next(value[key])}`);
    if (getting && name !== "Object")
      for (const getter of getters(value)) {
        let held;
        try { held = value[getter]; } catch (error) { held = `‹threw ${error.message}›`; }
        rows.push(`${pad}  get ${getter} → ${next(held)}`);
      }
    if (rows.length === 0) return `${head}{}`;
    return `${head}{\n${rows.join(",\n")}\n${pad}}`;
  } finally {
    seen.delete(value);
  }
};

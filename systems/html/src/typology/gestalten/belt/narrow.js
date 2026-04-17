// ─── matchers ────────────────────────────────────────────
// each matcher constructor returns (term, node) => boolean

export function text(...fields) {
  return (term, node) => {
    for (const field of fields) {
      const value = dig(node, field);
      if (typeof value === "string" && value.toLowerCase().includes(term)) return true;
    }
    return false;
  };
}

export function keyed() {
  return (term, node) => {
    const k = node.signature?.keyed;
    if (!k) return false;
    const full = (k.modifier ? k.modifier + "+" + k.command : k.command).toLowerCase();
    return full.includes(term);
  };
}

export function exact(field) {
  return (term, node) => {
    const value = dig(node, field);
    return typeof value === "string" && value.toLowerCase() === term;
  };
}

// ─── narrow ──────────────────────────────────────────────

export function narrow(query, nodes, matchers) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return nodes;
  return nodes.filter((node) =>
    terms.every((term) => matchers.some((match) => match(term, node))),
  );
}

// ─── rankers ─────────────────────────────────────────────

export function byExact(query) {
  const q = query.toLowerCase().trim();
  return (a, b) => {
    const exactA = a.nature.toLowerCase() === q ? 1 : 0;
    const exactB = b.nature.toLowerCase() === q ? 1 : 0;
    return exactB - exactA;
  };
}

export function byPrefix(query) {
  const q = query.toLowerCase().trim();
  return (a, b) => {
    const prefixA = a.nature.toLowerCase().startsWith(q) ? 1 : 0;
    const prefixB = b.nature.toLowerCase().startsWith(q) ? 1 : 0;
    return prefixB - prefixA;
  };
}

export function byField(field, direction = 1) {
  return (a, b) => {
    const va = dig(a, field) ?? "";
    const vb = dig(b, field) ?? "";
    return (va < vb ? -1 : va > vb ? 1 : 0) * direction;
  };
}

export function rank(nodes, ...rankers) {
  if (!rankers.length) return nodes;
  return [...nodes].sort((a, b) => {
    for (const ranker of rankers) {
      const result = ranker(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

// ─── presets ─────────────────────────────────────────────

export const navigation = [
  text("nature", "signature.valence.name", "signature.valence.prompt"),
  keyed(),
];

export const inspector = [
  text("nature", "signature.valence.name"),
];

// ─── internal ────────────────────────────────────────────

function dig(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

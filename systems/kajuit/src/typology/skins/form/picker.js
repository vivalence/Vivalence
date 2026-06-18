// Shared picker helpers: the symbol catalog (loaded once per daemon), literal
// search, and domain-agnostic entity display.

const titleize = (slug) =>
  slug
    .split(".")
    .map((part) => part.replace(/-/g, " ").replace(/^\w/, (character) => character.toUpperCase()))
    .join(" › ");

// ── symbol catalog ─────────────────────────────────────────────────
// Symbols are a bounded static taxonomy (~hundreds); load the whole set once
// per daemon and serve facets/autocomplete from memory — no per-keystroke hits.

const catalogs = new WeakMap();

export function catalog(daemon) {
  if (!catalogs.has(daemon)) catalogs.set(daemon, load(daemon));
  return catalogs.get(daemon);
}

async function load(daemon) {
  const symbols = await daemon.entities.symbol.find({}, {});
  const facets = new Map();
  for (const symbol of symbols) {
    if (symbol.slug.startsWith("word.lemma.")) continue;
    const parts = symbol.slug.split(".");
    const key = parts.slice(0, -1).join(".") || symbol.slug; // category = slug minus the leaf value
    if (!facets.has(key)) facets.set(key, { key, label: titleize(key), values: [] });
    facets.get(key).values.push({ slug: symbol.slug, label: titleize(parts.at(-1)) });
  }
  return {
    all: symbols,
    facets: [...facets.values()].sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function filterCatalog(symbols, term) {
  const lower = term.toLowerCase();
  return symbols
    .filter((symbol) => symbol.slug.includes(lower) || symbolLabel(symbol).toLowerCase().includes(lower))
    .slice(0, 20);
}

// ── literal search ─────────────────────────────────────────────────
// Unbounded and dynamic — server search, rank-ordered, limit-capped.

export function searchLiterals(daemon, { term, symbols, limit = 20 }) {
  const where = {};
  if (term) where.search = term;
  if (symbols?.length) where.symbols = symbols;
  return daemon.entities.literal.find(where, { limit, orderBy: { rank: "ASC" } });
}

// ── display (domain-agnostic) ──────────────────────────────────────

export function symbolLabel(symbol) {
  return symbol?.trait?.LABELED?.name ?? titleize(symbol?.slug?.split(".").at(-1) ?? "");
}

export function entityLabel(entity) {
  return entity?.slug ?? entity?.id ?? "—";
}

// slug is the universal anchor; gloss introspects whatever trait text a literal
// carries (TRANSLATED known/learning, …) without hardcoding any trait name.
export function entityGloss(entity) {
  const trait = entity?.trait;
  if (!trait) return "";
  for (const value of Object.values(trait)) {
    if (value && typeof value === "object") {
      const text = Object.values(value).filter((each) => typeof each === "string" && each.length <= 80);
      if (text.length) return text.slice(0, 2).join(" · ");
    }
  }
  return "";
}

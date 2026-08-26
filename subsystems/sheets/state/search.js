// corpus-blind incremental search over a row set.
// the haystack is lowercased once at init; seek narrows the PREVIOUS match set whenever
// the new terms are strictly stricter than the old ones, and rescans otherwise.

export function init({ rows = [], keys, facets = [], text = "", index = 0 } = {}) {
  const columns = keys ?? Object.keys(rows[0] ?? {});
  const haystack = rows.map((row) => columns.map((key) => String(row[key] ?? "")).join(" ").toLowerCase());
  const fields = {};
  for (const facet of facets) fields[facet] = rows.map((row) => String(row[facet] ?? "").toLowerCase());
  const every = rows.map((_row, at) => at);

  const state = { rows, keys: columns, facets, haystack, fields, every, text: "", terms: parse("", facets), matches: every, index: 0 };
  return text ? { ...seek(state, text), index } : { ...state, index };
}

export function seek(state, text) {
  const terms = parse(text, state.facets);
  const pool = narrows(state.terms, terms) ? state.matches : state.every;
  const matches = pool.filter((at) => terms.every((term) => holds(state, at, term)));
  return { ...state, text, terms, matches, index: 0 };
}

export function move(state, delta) {
  const count = state.matches.length;
  if (!count) return state;
  return { ...state, index: Math.max(0, Math.min(count - 1, state.index + delta)) };
}

export function value(state) {
  const at = state.matches[state.index];
  return at === undefined ? null : state.rows[at];
}

export function slice(state, height) {
  const count = state.matches.length;
  const span = Math.min(height, count);
  const start = Math.max(0, Math.min(state.index - Math.floor((span - 1) / 2), count - span));
  return { start, rows: state.matches.slice(start, start + span).map((at) => state.rows[at]) };
}

// `owner:@viva` narrows one field, but ONLY for a key the corpus declared a facet —
// an undeclared `slug:dojo` stays a literal term, so no hidden law rides on the colon.
function parse(text, facets) {
  return text.toLowerCase().split(" ").map((token) => {
    const at = token.indexOf(":");
    const key = at > 0 ? token.slice(0, at) : null;
    return key && facets.includes(key) ? { key, value: token.slice(at + 1) } : { key: null, value: token };
  });
}

function holds(state, at, term) {
  const straw = term.key ? state.fields[term.key][at] : state.haystack[at];
  return straw.includes(term.value);
}

// narrowing is monotone only while every old term survives as a prefix of its new counterpart —
// typing `owner` then `owner:` re-keys the term and WIDENS the set, so that transition rescans.
function narrows(previous, next) {
  if (previous.length > next.length) return false;
  return previous.every((term, at) => next[at].key === term.key && next[at].value.startsWith(term.value));
}

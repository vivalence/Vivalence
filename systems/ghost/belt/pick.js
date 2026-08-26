import { search, Search } from "@vivalence/sheets";

// arbitration over a lens :: { label, rows, keys, facets, columns, reference }.
// one match is the answer, many open the picker with the input as its preset, none hands the
// caller back its own branch (a path, an @reference). the fold is the SAME one the picker runs,
// so a bare slug never costs a repaint.
export async function pick(ctx, lens, preset = "") {
  const { rows, keys, facets, columns, reference, label = "search", index = 0 } = lens;
  // a reference IS a query — `@viva/instance/localhost` is the three terms the haystack holds,
  // so a full triple resolves headlessly and a filesystem path simply matches nothing.
  const query = (preset ?? "").replaceAll("/", " ").trim();

  if (!rows.length) throw new Error(`pick: no ${label} on this system — nothing to choose from`);

  const state = search.seek(search.init({ rows, keys, facets }), query);
  if (state.matches.length === 1) {
    const row = search.value(state);
    return { row, reference: reference(row) };
  }
  if (!state.matches.length && query) return null;

  // a picker in a pipe is a hang, not a prompt — name the candidates and let the caller retype.
  if (!ctx.interactive) {
    const candidates = state.matches.map((at) => `  ${reference(rows[at])}`).join("\n");
    throw new Error(
      `pick: '${query}' matches ${state.matches.length} ${label} entries and this shell cannot prompt:\n${candidates}`,
    );
  }

  const chosen = await ctx.view.scroll.render({ rows, keys, facets, columns, query, label, index }, null, Search);
  if (!chosen || chosen.aborted) return { aborted: true };
  return { row: chosen, reference: reference(chosen) };
}

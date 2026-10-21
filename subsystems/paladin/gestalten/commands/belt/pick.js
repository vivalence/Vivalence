import * as views from "../views/index.js";

const matches = (row, keys, term) => {
  const at = term.indexOf(":");
  if (at > 0) return String(row[term.slice(0, at)] ?? "").toLowerCase().includes(term.slice(at + 1));
  return keys.some((key) => String(row[key] ?? "").toLowerCase().includes(term));
};

export const seek = (rows, keys, query = "") => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((row) => terms.every((term) => matches(row, keys, term)));
};

export async function pick(ctx, lens, preset = "") {
  const { rows, keys, columns, identifier, label = "search", index = 0 } = lens;
  const query = (preset ?? "").replaceAll("/", " ").trim();
  if (!rows.length) throw new Error(`pick: no ${label} on this system — nothing to choose from`);

  const found = seek(rows, keys, query);
  const exact = found.filter((row) => identifier(row) === preset || keys.some((key) => row[key] === preset));
  const narrowed = exact.length === 1 ? exact : found;
  if (narrowed.length === 1) return { row: narrowed[0], identifier: identifier(narrowed[0]) };
  if (!narrowed.length && query) return null;

  if (!ctx.hold) {
    const candidates = narrowed.map((row) => `  ${identifier(row)}`).join("\n");
    throw new Error(`pick: '${query}' matches ${narrowed.length} ${label} entries and this shell cannot prompt:\n${candidates}`);
  }

  const chosen = await ctx.hold(views.picker, { rows, keys, columns, query, label, index });
  if (chosen.aborted) return { aborted: true };
  return { row: chosen.row, identifier: identifier(chosen.row) };
}

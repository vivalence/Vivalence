import paladin from "@vivalence/paladin";

// a .env authored FROM a schema: groups become sections, describes become the comments above
// each key. state.env upserts values afterwards and leaves all of this alone.
export const fallback = (held) => held?.default ?? "";
export const MINTED = { SECRET_VIVA_JWT: () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))) };
export const mint = (schema, bag = {}) =>
  Object.fromEntries(
    Object.entries(MINTED)
      .filter(([key]) => key in (schema.properties ?? {}) && !bag[key])
      .map(([key, make]) => [key, make()]),
  );

export function scaffold(schema) {
  const groups = new Map();
  for (const [key, held] of Object.entries(schema.properties ?? {})) {
    const title = held.group ?? "other";
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push([key, held]);
  }
  const lines = [];
  for (const [title, entries] of groups) {
    lines.push(`## ${title}`);
    for (const [key, held] of entries) {
      if (held.description) lines.push(`# ${held.description}`);
      lines.push(paladin.state.line(key, fallback(held)));
    }
    lines.push("");
  }
  return lines.join("\n");
}

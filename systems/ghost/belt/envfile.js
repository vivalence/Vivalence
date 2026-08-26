// a .env authored FROM a schema: groups become sections, describes become the comments above
// each key. state.env upserts values afterwards and leaves all of this alone.
export function scaffold(schema) {
  const groups = new Map();
  for (const [key, held] of Object.entries(schema)) {
    const title = held.group ?? "other";
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push([key, held]);
  }
  const lines = [];
  for (const [title, entries] of groups) {
    lines.push(`## ${title}`);
    for (const [key, held] of entries) {
      if (held.describe) lines.push(`# ${held.describe}`);
      lines.push(`${key}="${held.default ?? ""}"`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

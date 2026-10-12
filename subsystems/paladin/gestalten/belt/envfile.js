const MINTED = { SECRET_VIVA_JWT: () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))) };

export default function envfile(paladin) {
  const fallback = (held) => held?.default ?? "";

  const mint = (schema, bag = {}) =>
    Object.fromEntries(
      Object.entries(MINTED)
        .filter(([key]) => key in (schema.properties ?? {}) && !bag[key])
        .map(([key, make]) => [key, make()]),
    );

  const scaffold = (schema) => {
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
  };

  paladin.envfile = { MINTED, fallback, mint, scaffold };
}

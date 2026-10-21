export const hits = (word, low) => {
  const at = low.indexOf(word);
  if (at >= 0) return Array.from(word, (_, k) => at + k);
  const positions = [];
  for (let k = 0; k < low.length && positions.length < word.length; k += 1) if (low[k] === word[positions.length]) positions.push(k);
  return positions.length < word.length ? null : positions;
};

export const match = (query, text) => {
  const words = query.toLowerCase().trim().split(/\s+/).filter((word) => word !== "");
  if (words.length === 0) return [{ text, hit: false }];
  const found = words.map((word) => hits(word, text.toLowerCase()));
  if (found.includes(null)) return null;
  const marked = new Set(found.flat());
  return [...text].reduce((parts, character, k) => {
    const last = parts.at(-1);
    if (last !== undefined && last.hit === marked.has(k)) return [...parts.slice(0, -1), { text: last.text + character, hit: last.hit }];
    return [...parts, { text: character, hit: marked.has(k) }];
  }, []);
};

export const typed = (draft) => draft.split(" ")[0].slice(1);

export const filled = (row) => (row.args ? `${row.nature} ` : row.nature);

export const completions = (catalog, draft) =>
  catalog
    .map((row) => ({ row, parts: match(typed(draft), row.nature.slice(1)) }))
    .filter((completion) => completion.parts !== null)
    .map(({ row, parts }) => ({ row, parts: [{ text: "/", hit: false }, ...parts] }));

const NAMED = /^(\/\S+) (.*)$/;

export const choosing = (catalog, draft) => {
  const named = NAMED.exec(draft);
  if (named === null) return null;
  const command = catalog.find((row) => row.nature === named[1]);
  if (command === undefined || command.options.length === 0) return null;
  return { nature: command.nature, filter: named[2], options: command.options.map(String).filter((option) => option.includes(named[2])) };
};

export const listed = (catalog, draft) => {
  const chooser = choosing(catalog, draft);
  if (chooser !== null) return chooser.options.map((option) => `${chooser.nature} ${option}`);
  return completions(catalog, draft).map((completion) => filled(completion.row));
};

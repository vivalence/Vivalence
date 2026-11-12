import { belt } from "@vivalence/typology";

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

const KINDS = [
  (word, nature) => nature === word,
  (word, nature) => nature.startsWith(word),
  (word, nature) => nature.includes(word),
  () => true,
];

export const kind = (word, nature) => KINDS.findIndex((test) => test(word, nature));

export const ranked = (word, matched) =>
  word === ""
    ? matched
    : matched
        .map((completion) => ({ completion, kind: kind(word, completion.row.nature.slice(1).toLowerCase()) }))
        .sort((a, b) => a.kind - b.kind || a.completion.row.nature.length - b.completion.row.nature.length)
        .map(({ completion }) => completion);

export const completions = (catalog, draft) =>
  ranked(
    typed(draft).toLowerCase(),
    catalog
      .map((row) => ({ row, parts: match(typed(draft), row.nature.slice(1)) }))
      .filter((completion) => completion.parts !== null)
      .map(({ row, parts }) => ({ row, parts: [{ text: "/", hit: false }, ...parts] })),
  );

export const narrowed = (options, words) => {
  const named = options.filter((option) => option === words.join(" "));
  if (named.length === 1) return named;
  return options.filter((option) => words.every((word) => option.includes(word)));
};

const NAMED = /^(\/\S+) (.*)$/;

export const choosing = (catalog, draft) => {
  const named = NAMED.exec(draft);
  if (named === null) return null;
  const command = catalog.find((row) => row.nature === named[1]);
  if (command === undefined || command.options.length === 0) return null;
  const words = named[2].split(" ").filter((word) => word !== "");
  const options = command.options.map(String).filter((option) => words.every((word) => option.includes(word)));
  return { nature: command.nature, filter: named[2], options };
};

const stemmed = (references, word) => {
  const stem = word.slice(0, word.lastIndexOf("/") + 1);
  const depth = belt.reference.natures(stem).length;
  const next = references
    .filter((reference) => belt.reference.within(reference, stem))
    .map((reference) => belt.reference.natures(reference)[depth])
    .filter((segment) => segment !== undefined && segment.startsWith(word.slice(stem.length)));
  return belt.array.unique(next).map((segment) => `${stem}${segment}`);
};

const SEGMENTED = [
  [(word) => word === "", (references) => stemmed(references, "/")],
  [(word) => word.startsWith("/"), stemmed],
  [() => true, (references, word) => references.filter((reference) => reference.includes(word))],
];

export const segments = (references, word) => SEGMENTED.find(([test]) => test(word))[1](references, word);

const referencing = (row) =>
  row.input !== undefined && row.input.type === "object" && "references" in row.input.properties;

export const pathing = (catalog, draft, offered) => {
  const named = NAMED.exec(draft);
  if (named === null) return null;
  const command = catalog.find((row) => row.nature === named[1]);
  if (command === undefined || !referencing(command)) return null;
  const words = named[2].split(" ");
  const ticked = words.slice(0, -1).filter((word) => word !== "");
  return {
    nature: command.nature,
    filter: words.at(-1),
    head: [command.nature, ...ticked].join(" "),
    ticked,
    options: segments(offered(command.nature), words.at(-1)),
  };
};

export const listed = (catalog, draft) => {
  const chooser = choosing(catalog, draft);
  if (chooser !== null) return chooser.options.map((option) => `${chooser.nature} ${option}`);
  return completions(catalog, draft).map((completion) => filled(completion.row));
};

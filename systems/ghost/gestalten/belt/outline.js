import { is } from "@vivalence/typology";

const scalar = (value) => (is.object(value) ? Object.keys(value).length === 0 : !is.array(value));

const shown = (value) => (value === null || value === undefined || value === "" || is.object(value) ? "—" : String(value));

const listed = (values) => (values.length === 0 ? "—" : values.map(shown).join(" · "));

const indented = (depth) => "  ".repeat(depth);

export const outline = (value, bold = (text) => text) => {
  const table = (entries, depth) => {
    const keys = [...new Set(entries.flatMap((entry) => Object.keys(entry)))];
    const columns = keys.filter((key) => entries.every((entry) => scalar(entry[key])));
    const widths = columns.map((key) => Math.max(key.length, ...entries.map((entry) => shown(entry[key]).length)));
    const printed = (cells) => indented(depth) + cells.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
    const nested = (entry) => Object.fromEntries(keys.filter((key) => !columns.includes(key) && !scalar(entry[key])).map((key) => [key, entry[key]]));
    return [printed(columns), ...entries.flatMap((entry) => [printed(columns.map((key) => shown(entry[key]))), ...walk(nested(entry), depth + 1)])];
  };

  const fields = (record, depth) => {
    const width = Math.max(0, ...Object.keys(record).map((key) => key.length));
    return Object.entries(record).flatMap(([key, held]) => {
      if (scalar(held)) return [`${indented(depth)}${key.padEnd(width)}  ${shown(held)}`];
      if (is.array(held) && held.every(scalar)) return [`${indented(depth)}${key.padEnd(width)}  ${listed(held)}`];
      if (depth === 0) return [bold(key), ...walk(held, 1), ""];
      return [`${indented(depth)}${key}`, ...walk(held, depth + 1)];
    });
  };

  const ARMS = [
    [(held) => is.array(held) && held.every(scalar), (held, depth) => [indented(depth) + listed(held)]],
    [(held) => is.array(held) && held.every(is.object), table],
    [is.array, (held, depth) => held.flatMap((each) => [...walk(each, depth), ""])],
    [(held) => !is.object(held), (held, depth) => [indented(depth) + shown(held)]],
    [() => true, fields],
  ];

  const walk = (held, depth) => ARMS.find(([test]) => test(held))[1](held, depth);

  return walk(value, 0).join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
};

const FLOOR = 6;

const GUTTER = 2;

const shown = (value) => (value === null || value === undefined ? "—" : Array.isArray(value) ? value.join(" ") : String(value));

const clip = (text, room) =>
  text.length <= room ? text : text.includes("/") ? `…${text.slice(-(room - 1))}` : text.slice(0, room);

const shrink = (size, width) => {
  const keys = Object.keys(size);
  const total = keys.reduce((sum, key) => sum + size[key] + GUTTER, 0);
  if (total <= width) return size;
  const widest = keys.reduce((held, key) => (size[held] >= size[key] ? held : key));
  if (size[widest] <= FLOOR) return size;
  return shrink({ ...size, [widest]: size[widest] - 1 }, width);
};

export const table = (rows, width) => {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key) =>
    rows.some((row) => row[key] !== null && row[key] !== undefined)
  );
  const size = shrink(
    Object.fromEntries(keys.map((key) => [key, Math.max(key.length, ...rows.map((row) => shown(row[key]).length))])),
    width,
  );
  const line = (row) => keys.map((key) => clip(shown(row[key]), size[key]).padEnd(size[key])).join(" ".repeat(GUTTER));
  return { head: line(Object.fromEntries(keys.map((key) => [key, key]))), body: rows.map(line) };
};

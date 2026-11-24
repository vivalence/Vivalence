import { specimen } from "@vivalence/typology";
import { declarations, design, scales } from "@vivalence/dapper";

const ROOTS = [new URL("../../src/", import.meta.url).pathname, new URL("../../../../subsystems/drapes/", import.meta.url).pathname];
const RETIRED = /colors-skeleton|colors-palette|colors-theme|colors-system|--text-(primary|body|support)\b|--shadow-(soft|strong)|--zone-|-skeleton-\$?\{?|useSkeleton|SkeletonProvider|Decorum|--mix-deep/;
const FAMILY = /^--(plane|boundary|divider|inverse|shadow|scrim|dim|shape|size|text|control|signal)(-|$)/;

const ds = await design();
const slots = new Set(declarations(ds.themes.northsea.zones[1]).map(([name]) => name));
const scale = new Set([...scales().matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((match) => match[1]));

const files = (directory, found = []) => {
  for (const entry of Deno.readDirSync(directory)) {
    const path = `${directory}${entry.name}`;
    if (entry.name.includes("bak") || entry.name === "node_modules" || entry.name === "tests") continue;
    if (entry.isDirectory) files(`${path}/`, found);
    else if (/\.(svelte|html|js|css)$/.test(entry.name)) found.push(path);
  }
  return found;
};

const sources = ROOTS.flatMap((root) => files(root)).map((path) => ({ path, lines: Deno.readTextFileSync(path).split("\n") }));
const short = (path) => path.slice(path.indexOf("/vivalence/code/vivalence/") + 26);
const code = (line) => !/^\s*(\/\/|\/\*|\*|<!--)/.test(line);

const reads = sources.flatMap(({ path, lines }) =>
  lines.flatMap((line, index) => [...line.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((match) => ({ at: `${short(path)}:${index + 1}`, name: match[1], path, line })))
);
const locals = new Set(sources.flatMap(({ lines }) => lines.flatMap((line) => [...line.matchAll(/(?:^|[\s;{"'])(--[a-z0-9-]+)\s*[:=]/g)].map((match) => match[1]))));

specimen.describe("zones — anima and drapes read by name", () => {
  specimen.it("the census is not empty", () => {
    specimen.expect(sources.length > 100).toBe(true);
    specimen.expect(reads.length > 1000).toBe(true);
  });

  specimen.it("no live file names a retired token, class or context", () => {
    const hits = sources.flatMap(({ path, lines }) => lines.flatMap((line, index) => (code(line) && RETIRED.test(line) ? [`${short(path)}:${index + 1}`] : [])));
    specimen.expect(hits).toEqual([]);
  });

  specimen.it("every read inside a slot family is a name the sheet declares", () => {
    const stray = reads.filter(({ name }) => FAMILY.test(name) && !slots.has(name) && !locals.has(name)).map(({ at, name }) => `${at} ${name}`);
    specimen.expect(stray).toEqual([]);
  });

  specimen.it("no component shadows a slot with a local of the same name", () => {
    const shadowed = [...locals].filter((name) => slots.has(name));
    specimen.expect(shadowed).toEqual([]);
  });

  specimen.it("every read of a dapper family is a name the sheet emits: a slot or a scale", () => {
    const DAPPER = /^--(font|line-height|border-radius|box-shadow|drop-shadow|spacing|container|animation|colors|brand|filter|mix|zone)-/;
    const stray = reads.filter(({ name }) => DAPPER.test(name) && !scale.has(name) && !slots.has(name) && !locals.has(name)).map(({ at, name }) => `${at} ${name}`);
    specimen.expect(stray).toEqual([]);
  });

  specimen.it("dapper itself reads no retired token: its scales, its plugin", () => {
    const dapper = new URL("../../../../subsystems/dapper/", import.meta.url).pathname;
    const hits = files(dapper).flatMap((path) =>
      Deno.readTextFileSync(path).split("\n").flatMap((line, index) => (code(line) && RETIRED.test(line) ? [`${short(path)}:${index + 1}`] : [])));
    specimen.expect(hits).toEqual([]);
  });

  specimen.it("no surface holds a hex of a theme's ground, text or signal", () => {
    const painted = new Set(
      Object.values(ds.themes).flatMap((held) => held.zones.flatMap((zone) => declarations(zone).map(([, value]) => value))).filter((value) => /^#[0-9A-F]{6}$/i.test(value)).map((value) => value.toUpperCase()),
    );
    const hits = sources.flatMap(({ path, lines }) =>
      lines.flatMap((line, index) => (code(line) && !/name="theme-color"/.test(line) ? [...line.matchAll(/#[0-9A-Fa-f]{6}\b/g)].filter(([hex]) => painted.has(hex.toUpperCase())).map(([hex]) => `${short(path)}:${index + 1} ${hex}`) : [])));
    specimen.expect(hits).toEqual([]);
  });
});

import { specimen } from "@vivalence/typology";

const SOURCE = new URL("../../src/", import.meta.url).pathname;

const PLACES = {
  "client.html": ["1"],
  "app/panels/a/a.svelte": ["1"],
  "app/panels/b/b.svelte": ["0"],
  "app/panels/c/c.svelte": ["0"],
  "app/panels/g/g.svelte": ["0"],
  "app/panels/h/h.svelte": ["3"],
  "app/bones/crown/crown.svelte": ["0"],
  "app/bones/shoulder/shoulder.svelte": ["0"],
  "app/bones/spine/spine.svelte": ["0", "0"],
  "app/bones/pincer/pincer.svelte": ["0", "0", "0", "0", "0"],
  "app/design/+page.svelte": ["1", "0", "1", "2", "3", "0", "1", "2", "3"],
};

const files = (directory, found = []) => {
  for (const entry of Deno.readDirSync(directory)) {
    const path = `${directory}${entry.name}`;
    if (entry.name.includes("bak") || entry.name === "node_modules") continue;
    if (entry.isDirectory) files(`${path}/`, found);
    else if (/\.(svelte|html|js|css)$/.test(entry.name)) found.push(path);
  }
  return found;
};

const declared = Object.fromEntries(
  files(SOURCE)
    .map((path) => [path.slice(SOURCE.length), [...Deno.readTextFileSync(path).matchAll(/data-zone="([^"]*)"/g)].map((match) => match[1])])
    .filter(([, zones]) => zones.length),
);

specimen.describe("zones — a place takes its zone by what it is", () => {
  specimen.it("the territories of the place map, and no other box, declare a zone", () => {
    specimen.expect(declared).toEqual(PLACES);
  });

  specimen.it("every declared zone is one of the four", () => {
    for (const zone of Object.values(declared).flat()) specimen.expect(["0", "1", "2", "3"].includes(zone)).toBe(true);
  });

  specimen.it("no zone is computed: data-zone is a literal, never an expression", () => {
    const computed = files(SOURCE).filter((path) => /data-zone=\{|dataset\.zone|data-zone="\{/.test(Deno.readTextFileSync(path)));
    specimen.expect(computed).toEqual([]);
  });

  specimen.it("the page's ground is the body", () => {
    specimen.expect(Deno.readTextFileSync(`${SOURCE}client.html`).includes('<body data-zone="1">')).toBe(true);
  });

  specimen.it("the chrome opens in zone 0: every bone and both rails, and nothing under them opens another zone", () => {
    const chrome = Object.entries(PLACES).filter(([path]) => /bones\/|panels\/[bc]\//.test(path));
    specimen.expect(chrome).toHaveLength(6);
    for (const [path, zones] of chrome) specimen.expect([path, [...new Set(zones)]]).toEqual([path, ["0"]]);
  });

  specimen.it("the cards declare nothing: they sit in rail C's chrome", () => {
    const panes = [
      "app/panels/c/cards/Card.svelte",
      "app/panels/c/cards/Row.svelte",
      "app/panels/c/cards/Link.svelte",
      "app/panels/c/cards/Terminals.svelte",
      "app/panels/c/cards/Threads.svelte",
      "app/panels/c/cards/Modes.svelte",
      "app/panels/c/cards/Thread.svelte",
      "app/panels/c/cards/Mode.svelte",
      "app/panels/c/cards/Buffers.svelte",
      "app/panels/c/cards/Buffer.svelte",
      "app/panels/c/cards/Harness.svelte",
    ];
    for (const path of panes) {
      specimen.expect([path, Deno.statSync(`${SOURCE}${path}`).isFile, declared[path]]).toEqual([path, true, undefined]);
    }
  });

  specimen.it("no view names a zone number in a style", () => {
    const hits = files(SOURCE).filter((path) => /\[data-zone|zone-[0-3]\b/.test(Deno.readTextFileSync(path)));
    specimen.expect(hits).toEqual([]);
  });
});

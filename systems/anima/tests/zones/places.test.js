import { specimen } from "@vivalence/typology";

const SOURCE = new URL("../../src/", import.meta.url).pathname;

const PLACES = {
  "client.html": ["1"],
  "app/panels/a/a.svelte": ["1"],
  "app/panels/b/b.svelte": ["0"],
  "app/panels/c/c.svelte": ["0", "1"],
  "app/panels/g/g.svelte": ["0"],
  "app/panels/h/h.svelte": ["3"],
  "app/bones/crown/crown.svelte": ["0"],
  "app/bones/shoulder/shoulder.svelte": ["0"],
  "app/bones/spine/spine.svelte": ["0"],
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

  specimen.it("the chrome opens in zone 0: every bone and both rails; the thread pane's body alone is the body", () => {
    const chrome = Object.entries(PLACES).filter(([path]) => /bones\/|panels\/[bc]\//.test(path));
    specimen.expect(chrome).toHaveLength(6);
    for (const [path, zones] of chrome) specimen.expect([path, zones[0]]).toEqual([path, "0"]);
    const bodies = chrome.filter(([, zones]) => zones.some((zone) => zone !== "0"));
    specimen.expect(bodies).toEqual([["app/panels/c/c.svelte", ["0", "1"]]]);
    const rail = Deno.readTextFileSync(`${SOURCE}app/panels/c/c.svelte`);
    specimen.expect(rail.includes('<div data-zone="1" class="thread-body"><PanelF /></div>')).toBe(true);
  });

  specimen.it("the panes declare nothing: they sit in rail C's chrome, the thread pane's body in the box rail C opens for it", () => {
    const panes = [
      "app/panels/d/d.svelte",
      "app/panels/e/e.svelte",
      "app/panels/f/f.svelte",
      "app/panels/c/widgets/Pane.svelte",
      "app/panels/c/panes/Terminals.svelte",
      "app/panels/c/panes/Mode.svelte",
      "app/panels/c/panes/Buffer.svelte",
      "app/panels/c/panes/Harness.svelte",
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

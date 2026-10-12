import { specimen } from "@vivalence/typology";
import { declarations, scales, THEMES } from "@vivalence/dapper";
import { surface } from "./rig.js";

const DOM = new URL("../../dom/", import.meta.url);

const sources = async (directory) => {
  const held = [];
  for await (const entry of Deno.readDir(directory)) {
    const url = new URL(entry.name + (entry.isDirectory ? "/" : ""), directory);
    if (entry.isDirectory) held.push(...(await sources(url)));
    else held.push({ path: url.pathname.slice(DOM.pathname.length), text: await Deno.readTextFile(url) });
  }
  return held;
};

const PREFIXES = ["kit-", "chassis-", "signin-", "crown-", "dock-", "frame-", "navigation-"];

const reads = (text) => [...new Set([...text.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((match) => match[1]))];

const owned = (text) => new Set([...text.matchAll(/"(--[a-z0-9-]+)":/g)].map((match) => match[1]));

const ruled = (selector) => !selector.startsWith("@") && !/^(to|from|\d+%)/.test(selector);

const selectors = (sheet) => [...sheet.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim()).filter(ruled);

const classes = (sheet) => [...new Set(selectors(sheet).flatMap((selector) => [...selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1])))];

specimen.describe("dom sheet — every colour and length is a dapper slot, every class carries its family", () => {
  specimen.it("no source under dom/ carries a hex literal, a color-mix or a 50% radius", async () => {
    for (const { path, text } of await sources(DOM)) {
      specimen.expect([path, /#[0-9a-fA-F]{3,8}\b/.test(text), /color-mix/.test(text), /border-radius: 50%/.test(text)]).toEqual([path, false, false, false]);
    }
  });

  for (const [name, theme] of Object.entries(THEMES)) {
    specimen.it(`every var() the sheet reads is declared by ${name} in every zone, or set by the component itself`, async () => {
      const module = await surface;
      const local = new Set((await sources(DOM)).flatMap(({ text }) => [...owned(text)]));
      const scale = new Set([...scales().matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1]));
      for (const zone of Object.keys(theme.zones)) {
        const slots = new Set(declarations(theme.zones[zone]).map(([slot]) => slot));
        specimen.expect([name, zone, reads(module.sheet).filter((slot) => !slots.has(slot) && !scale.has(slot) && !local.has(slot))]).toEqual([name, zone, []]);
      }
    });
  }

  specimen.it("every class in the sheet is prefixed by its family, never a bare utility name", async () => {
    const module = await surface;
    const strays = classes(module.sheet).filter((name) => !PREFIXES.some((prefix) => name.startsWith(prefix)));
    specimen.expect(strays).toEqual([]);
    specimen.expect(classes(module.sheet).length > 40).toBe(true);
  });

  specimen.it("every multi-file directory under dom/ carries an index.js barrel", async () => {
    const files = (await sources(DOM)).map(({ path }) => path);
    const directories = [...new Set(files.map((path) => path.split("/").slice(0, -1).join("/")))];
    for (const directory of directories) {
      specimen.expect([directory, files.includes(directory === "" ? "index.js" : `${directory}/index.js`)]).toEqual([directory, true]);
    }
  });
});

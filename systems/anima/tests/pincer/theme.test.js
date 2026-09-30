import { specimen } from "@vivalence/typology";
import { contrast, design } from "@vivalence/dapper";
import { Bridge, THEMES, knownTheme } from "../../src/typology/stores/bridge/bridge.js";

const source = (path) => Deno.readTextFileSync(new URL(`../../src/${path}`, import.meta.url));
const STORAGE_KEY = "vivalence:bridge";

const withSaved = (saved, run) => {
  const held = globalThis.localStorage.getItem(STORAGE_KEY);
  if (saved === null) globalThis.localStorage.removeItem(STORAGE_KEY);
  else globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  try {
    return run();
  } finally {
    if (held === null) globalThis.localStorage.removeItem(STORAGE_KEY);
    else globalThis.localStorage.setItem(STORAGE_KEY, held);
  }
};

specimen.describe("theme names — one list, every reader agrees with it", () => {
  specimen.it("the list is northsea · parchment · porcelain · datasette, northsea the default", () => {
    specimen.expect(THEMES).toEqual(["northsea", "parchment", "porcelain", "datasette"]);
    specimen.expect(knownTheme(undefined)).toBe("northsea");
  });

  specimen.it("a known name resolves to itself", () => {
    for (const name of THEMES) specimen.expect(knownTheme(name)).toBe(name);
  });

  specimen.it("a name outside the list resolves to the default", () => {
    for (const name of ["nordic", "paper", "ledger", "superdisk", "", null, 0, "Northsea", " northsea"]) {
      specimen.expect([name, knownTheme(name)]).toEqual([name, "northsea"]);
    }
  });

  specimen.it("dapper emits a block for every name in the list, and for no other", async () => {
    const { output } = await design();
    const emitted = [...new Set([...output.css.matchAll(/:root\[data-theme="([^"]+)"\]/g)].map((match) => match[1]))];
    specimen.expect(emitted.sort()).toEqual([...THEMES].sort());
  });
});

specimen.describe("theme names — the bridge boots on a saved name", () => {
  specimen.it("nothing saved boots the default", () => {
    withSaved(null, () => specimen.expect(new Bridge().view.theme).toBe("northsea"));
  });

  specimen.it("a saved known name survives the boot", () => {
    withSaved({ view: { theme: "parchment" } }, () => specimen.expect(new Bridge().view.theme).toBe("parchment"));
  });

  specimen.it("a saved retired name boots the default, never a blank sheet", () => {
    for (const name of ["nordic", "paper"]) {
      withSaved({ view: { theme: name } }, () => specimen.expect([name, new Bridge().view.theme]).toEqual([name, "northsea"]));
    }
  });

  specimen.it("setTheme refuses a name outside the list and saves the default", () => {
    withSaved(null, () => {
      const bridge = new Bridge();
      bridge.setTheme("parchment");
      specimen.expect(bridge.view.theme).toBe("parchment");
      bridge.setTheme("nordic");
      specimen.expect(bridge.view.theme).toBe("northsea");
      specimen.expect(JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY)).view.theme).toBe("northsea");
    });
  });
});

specimen.describe("theme names — the views that spell a name", () => {
  specimen.it("client.html boots on the default and guards the saved name with the same list", () => {
    const html = source("client.html");
    specimen.expect(html.match(/<html[^>]*data-theme="([^"]+)"/)[1]).toBe(THEMES[0]);
    const guard = html.match(/if \((\[[^\]]+\])\.includes\(bridge\?\.view\?\.theme\)\)/);
    specimen.expect(JSON.parse(guard[1])).toEqual(THEMES);
  });

  specimen.it("the pincer's mark names no theme: a mask on the ink of its ground", () => {
    const pincer = source("app/bones/pincer/pincer.svelte");
    specimen.expect(["PICTOGRAMS", "TINTS", "view.$theme", "view.theme"].filter((name) => pincer.includes(name))).toEqual([]);
    specimen.expect(THEMES.filter((name) => pincer.includes(name))).toEqual([]);
    specimen.expect(/\.viket-pictogram::before \{[^}]*background: currentColor;[^}]*mask: url\(/s.test(pincer)).toBe(true);
  });

  specimen.it("the picker reads the bridge's list, never its own", () => {
    const picker = source("app/panels/b/widgets/BridgeSection.svelte");
    specimen.expect(picker.includes("const THEMES = stores.bridge.THEMES;")).toBe(true);
  });

  specimen.it("no source file under src names a retired theme outside a comment", () => {
    const retired = /(["'`=.\[])(nordic|paper)\b/;
    const hits = [];
    const walk = (directory) => {
      for (const entry of Deno.readDirSync(directory)) {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory) {
          if (entry.name !== "bak" && entry.name !== "node_modules") walk(path);
          continue;
        }
        if (!/\.(js|svelte|html|css)$/.test(entry.name)) continue;
        Deno.readTextFileSync(path).split("\n").forEach((line, index) => {
          if (/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) return;
          if (retired.test(line)) hits.push(`${path}:${index + 1}`);
        });
      }
    };
    walk(new URL("../../src", import.meta.url).pathname);
    specimen.expect(hits).toEqual([]);
  });
});

specimen.describe("theme names — the radial reads in every theme", () => {
  specimen.it("on the chrome zone of all four themes the hint, the tiles on and off, the centre, the rim dots and the minis keep their inks apart", async () => {
    const pincer = source("app/bones/pincer/pincer.svelte");
    const style = pincer.split("<style>")[1].replace(/\/\*[\s\S]*?\*\//g, "");
    const declared = (text) =>
      Object.fromEntries([...text.matchAll(/(?<![\w-])(--[a-z0-9-]+|color|background-color|background)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
    const rules = [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({ selectors: selectors.split(",").map((selector) => selector.trim()), body: declared(body) }));
    const rule = (...wanted) => Object.assign({}, ...rules.filter(({ selectors }) => selectors.some((selector) => wanted.includes(selector))).map(({ body }) => body));
    const inks = Object.fromEntries([...pincer.match(/const INKS = \{([^}]*)\}/)[1].matchAll(/(\w+): "([^"]+)"/g)].map(([, block, value]) => [block, value]));

    const tile = rule(".radial-tile");
    const tileOn = rule(".radial-tile", ".radial-tile.on");
    const lock = rule(".radial-lock");
    const lockOn = rule(".radial-lock", ".radial-lock.on");
    const hint = rule(".radial-hint");
    const frame = rule(".radial-mini").background;
    const pairs = [
      ["hint", hint.color, hint.background, 4.5],
      ["tile glyph, off", tile["--glyph"], tile["background-color"], 3],
      ["tile glyph, on", tileOn["--glyph"], tileOn["background-color"], 3],
      ["tile face, on against off", tileOn["background-color"], tile["background-color"], 3],
      ["centre glyph, off", lock["--glyph"], lock["background-color"], 3],
      ["centre glyph, on", lockOn["--glyph"], lockOn["background-color"], 3],
      ["centre face, on against off", lockOn["background-color"], lock["background-color"], 3],
      ["rim dot, hot against cold", rule(".radial-dot", ".radial-dot.hot").background, rule(".radial-dot").background, 3],
      ["mini bones against the stage", frame, inks.a, 3],
      ["mini bones against a panel", frame, inks.b, 3],
      ["mini bones against the sunk panel", frame, inks.c, 3],
      ["mini stage against a panel", inks.a, inks.b, 1.5],
    ];

    const sheet = (await design()).output.css;
    const tokens = (selector) => {
      const start = sheet.indexOf(`${selector} {`);
      return start < 0 ? {} : Object.fromEntries([...sheet.slice(start, sheet.indexOf("}", start)).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
    };
    const failures = [];
    for (const name of THEMES) {
      const scope = { ...tokens(`:root[data-theme="${name}"]`), ...tokens(`:root[data-theme="${name}"] [data-zone="0"]`) };
      const resolve = (value) => {
        let current = value.replace(/^color-mix\(in srgb, (var\(--[a-z0-9-]+\)) \d+%, transparent\)$/, "$1");
        for (let depth = 0; depth < 8 && /^var\(--[a-z0-9-]+\)$/.test(current); depth++) current = scope[current.slice(4, -1)];
        return current;
      };
      for (const [label, ink, ground, floor] of pairs) {
        const ratio = contrast(resolve(ink), resolve(ground));
        if (!(ratio >= floor)) failures.push(`${name} · ${label}: ${ink} on ${ground} reads ${ratio.toFixed(2)}, under ${floor}`);
      }
    }
    specimen.expect(failures).toEqual([]);
  });
});

specimen.describe("theme names — the spine's cards read in every theme", () => {
  specimen.it("on the chrome zone of all four themes the hover card, the pinned card, its rows and its empty box keep text apart from its ground", async () => {
    const styleOf = (text) => text.split("<style>")[1].replace(/\/\*[\s\S]*?\*\//g, "");
    const rulesOf = (style) =>
      [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
        selectors: selectors.split(",").map((selector) => selector.trim()),
        body: Object.fromEntries([...body.matchAll(/(?<![\w-])(color|background)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()])),
      }));
    const spine = rulesOf(styleOf(source("app/bones/spine/spine.svelte")));
    const float = rulesOf(styleOf(Deno.readTextFileSync(new URL("../../../../subsystems/drapes/panels/Float.svelte", import.meta.url))));
    const rule = (rules, ...wanted) => Object.assign({}, ...rules.filter(({ selectors }) => selectors.some((selector) => wanted.includes(selector))).map(({ body }) => body));

    const card = rule(spine, ".spine-card").background;
    const pinned = rule(float, ".float").background;
    const picked = rule(spine, ".spine-row.picked").background;
    const pairs = [
      ["hover card · name", rule(spine, ".spine-name").color, card],
      ["hover card · modes and threads", rule(spine, ".spine-sub").color, card],
      ["hover card · activity", rule(spine, ".spine-act-name").color, card],
      ...["primary", "positive", "caution", "negative"].map((tone) => [`hover card · ${tone} state`, rule(spine, `.spine-state.${tone}`).color, card]),
      ["pinned card · title", rule(spine, ".spine-title").color, pinned],
      ["pinned card · labels", rule(spine, ".spine-label").color, pinned],
      ["pinned card · keys", rule(spine, ".spine-key").color, pinned],
      ["pinned card · values", rule(spine, ".spine-value").color, pinned],
      ["pinned card · a row", rule(spine, ".spine-row-name").color, pinned],
      ["pinned card · the picked row", rule(spine, ".spine-row-name").color, picked],
      ["pinned card · a busy count, picked", rule(spine, ".spine-row-live.busy").color, picked],
      ["pinned card · an activity, hovered", rule(spine, ".spine-kid-name").color, rule(spine, ".spine-kid:hover").background],
      ["pinned card · no connection", rule(spine, ".spine-off").color, rule(spine, ".spine-off").background],
    ];

    const sheet = (await design()).output.css;
    const tokens = (selector) => {
      const start = sheet.indexOf(`${selector} {`);
      return start < 0 ? {} : Object.fromEntries([...sheet.slice(start, sheet.indexOf("}", start)).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
    };
    const failures = [];
    for (const name of THEMES) {
      const scope = { ...tokens(`:root[data-theme="${name}"]`), ...tokens(`:root[data-theme="${name}"] [data-zone="0"]`) };
      const resolve = (value) => {
        let current = value;
        for (let depth = 0; depth < 8 && /^var\(--[a-z0-9-]+\)$/.test(current); depth++) current = scope[current.slice(4, -1)];
        return current;
      };
      for (const [label, ink, ground] of pairs) {
        const ratio = contrast(resolve(ink), resolve(ground));
        if (!(ratio >= 4.5)) failures.push(`${name} · ${label}: ${ink} on ${ground} reads ${ratio.toFixed(2)}, under 4.5`);
      }
    }
    specimen.expect(failures).toEqual([]);
  });
});

import { describe, it, beforeAll, afterAll } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { v, crypto, mime } from "@vivalence/typology";
import esbuild from "esbuild";
import paladin from "../mod.js";
import { MEMBERS } from "../gestalten/belt/bundler.js";

const SOURCE = [
  "<script>",
  "  let { buffer } = $props();",
  "  let size = $state(18);",
  "</script>",
  "",
  '<div class="spawned" style:font-size="{size}px">',
  "  <h1>{buffer.data.title}</h1>",
  "  <button onclick={() => (size += 2)}>A+</button>",
  "</div>",
  "",
  "<style>",
  "  .spawned { height: 100%; overflow-y: auto; }",
  "</style>",
].join("\n");

const SOLID = [
  'import { createSignal } from "solid-js";',
  'import { render } from "solid-js/web";',
  'import { Panel } from "@vivalence/drapes/Panel.jsx";',
  "",
  "const App = (props) => {",
  "  const [size, setSize] = createSignal(18);",
  "  return (",
  '    <div class="spawned" style={{ "font-size": `${size()}px` }}>',
  "      <h1>{props.buffer.data.title}</h1>",
  '      <Panel tag="size"><button onClick={() => setSize(size() + 2)}>A+</button></Panel>',
  "    </div>",
  "  );",
  "};",
  "",
  "export default (element, props) => {",
  "  const dispose = render(() => <App {...props} />, element);",
  "  return { destroy: dispose };",
  "};",
].join("\n");

const SCENE = [
  "<script>",
  '  import { onMount } from "svelte";',
  '  import { fade } from "svelte/transition";',
  '  import { Text } from "@vivalence/drapes/svelte";',
  '  import { parts } from "@vivalence/dapper";',
  '  import { REVISION } from "three";',
  "  let shown = $state(false);",
  "  onMount(() => (shown = true));",
  "</script>",
  "",
  "<div transition:fade><Text>{shown} {REVISION} {parts.meter.CAUTION}</Text></div>",
].join("\n");

const named = (artifact) =>
  [...new Set([...artifact.matchAll(/^import (?:.* from )?"((?!\.|\/)[^"]+)";$/gm)].map((match) => match[1]))].sort();

let directory;
let bundler;

describe("paladin.bundler", { sanitizeResources: false, sanitizeOps: false }, () => {
  beforeAll(async () => {
    directory = await Deno.makeTempDir({
      dir: new URL("./", import.meta.url).pathname,
      prefix: "bundler-",
    });
    bundler = paladin.bundler(directory);
  });
  afterAll(async () => {
    await esbuild.stop();
    await Deno.remove(directory, { recursive: true });
  });

  it("a svelte source bundles to a content-addressed Bundle", async () => {
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, source: SOURCE });
    const hash = await crypto.digest(SOURCE);
    const stem = hash.slice(0, 16);

    expect(await Deno.readTextFile(`${directory}/bundle/${stem}.dom.svelte`)).toBe(SOURCE);
    const artifact = await Deno.readTextFile(`${directory}/bundle/${stem}.dom.svelte.mjs`);
    expect(artifact).toContain("as default");
    expect(bundle.json).toEqual({
      entries: [
        { mime: mime.dom.svelte, hash, mount: `/${stem}.dom.svelte.mjs`, integrity: await crypto.digest(artifact), bytes: artifact.length },
      ],
    });
    expect(v.bundle.check(bundle.json)).toBe(true);

    const stat = await Deno.stat(`${directory}/bundle/${stem}.dom.svelte.mjs`);
    const again = await bundler.bundle({ mime: mime.dom.svelte, source: SOURCE });
    expect(again.json).toEqual(bundle.json);
    expect((await Deno.stat(`${directory}/bundle/${stem}.dom.svelte.mjs`)).mtime).toEqual(stat.mtime);

    const served = await bundler.serve(`/${stem}.dom.svelte.mjs`);
    expect(served.text).toBe(artifact);
    expect(served.type).toBe("text/javascript");
    expect(served.integrity).toBe(bundle.entries[0].integrity);

    expect(await bundler.inspect(hash)).toEqual({ hash, source: SOURCE });
  });

  it("an on-disk entry bundles the same way (the app path)", async () => {
    const entry = `${directory}/Reader.svelte`;
    await Deno.writeTextFile(entry, SOURCE);
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, entry });

    expect(bundle.entries[0].mime).toBe(mime.dom.svelte);
    expect(v.bundle.check(bundle.json)).toBe(true);
    const served = await bundler.serve(bundle.entries[0].mount);
    expect(served.integrity).toBe(bundle.entries[0].integrity);
    expect(served.text).toContain("as default");
  });

  it("a solid dom source bundles to a browser module", async () => {
    const bundle = await bundler.bundle({ mime: mime.dom.solid, source: SOLID });
    const hash = await crypto.digest(SOLID);
    const stem = hash.slice(0, 16);

    expect(await Deno.readTextFile(`${directory}/bundle/${stem}.dom.solid`)).toBe(SOLID);
    const artifact = await Deno.readTextFile(`${directory}/bundle/${stem}.dom.solid.mjs`);
    expect(bundle.json).toEqual({
      entries: [
        { mime: mime.dom.solid, hash, mount: `/${stem}.dom.solid.mjs`, integrity: await crypto.digest(artifact), bytes: artifact.length },
      ],
    });
    expect(v.bundle.check(bundle.json)).toBe(true);

    expect(named(artifact)).toEqual(["solid-js", "solid-js/web"]);
    expect(artifact).toContain("crumb");
    expect(artifact).not.toContain("@opentui");
    expect(artifact).toMatch(/as default/);

    const served = await bundler.serve(bundle.entries[0].mount);
    expect(served.text).toBe(artifact);
    expect(await bundler.inspect(hash)).toEqual({ hash, source: SOLID });

    const entry = `${directory}/Reader.jsx`;
    await Deno.writeTextFile(entry, SOLID);
    const again = await bundler.bundle({ mime: mime.dom.solid, entry });
    expect(again.entries[0].mount).toMatch(/\.dom\.solid\.mjs$/);
    expect((await bundler.serve(again.entries[0].mount)).text).toContain("crumb");
  });

  it("a dom entry names its members and carries none of them", async () => {
    const entry = `${directory}/Scene.svelte`;
    await Deno.writeTextFile(entry, SCENE);
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, entry });
    const artifact = (await bundler.serve(bundle.entries[0].mount)).text;

    expect(named(artifact).filter((specifier) => !MEMBERS.includes(specifier))).toEqual([]);
    expect(named(artifact)).toEqual([
      "@vivalence/dapper",
      "@vivalence/drapes/svelte",
      "svelte",
      "svelte/internal/client",
      "svelte/internal/disclose-version",
      "svelte/transition",
      "three",
    ]);
    expect(artifact).not.toContain("WebGLRenderer");
    expect(artifact).not.toContain("font-sans-text");
  });

  it("a runtime subpath that is no member fails loud at the bundle", async () => {
    const entry = `${directory}/Compiler.svelte`;
    await Deno.writeTextFile(entry, '<script>\n  import { VERSION } from "svelte/compiler";\n</script>\n\n<p>{VERSION}</p>\n');
    await expect(bundler.bundle({ mime: mime.dom.svelte, entry })).rejects.toThrow('"svelte/compiler" is no member');
  });

  it("the members build once: every member a file, every chunk a member names a file", async () => {
    const held = await paladin.bundler.members();

    expect(Object.keys(held.imports).sort()).toEqual([...MEMBERS].sort());
    expect(Object.values(held.imports).filter((name) => !(name in held.files))).toEqual([]);
    const chunks = Object.values(held.files).flatMap((text) => [...text.matchAll(/from\s*"\.\/([^"]+)"/g)].map((match) => match[1]));
    expect(chunks.filter((name) => !(name in held.files))).toEqual([]);
    expect(Object.values(held.files).flatMap(named)).toEqual([]);
  });

  it("a solid dom source carries its sheet as text", async () => {
    await Deno.writeTextFile(`${directory}/desk.css`, ".desk{display:flex}");
    await Deno.writeTextFile(`${directory}/Desk.jsx`, 'import sheet from "./desk.css";\nexport default (element) => { element.textContent = sheet; return { destroy() {} }; };\n');
    const bundle = await bundler.bundle({ mime: mime.dom.solid, entry: `${directory}/Desk.jsx` });
    expect((await bundler.serve(bundle.entries[0].mount)).text).toContain(".desk{display:flex}");
  });

  it("an html source wraps into a module", async () => {
    const bundle = await bundler.bundle({ mime: mime.dom.html, source: "<h1>plain</h1>" });
    expect(bundle.entries[0].mount).toMatch(/\.dom\.html\.mjs$/);
    expect(v.bundle.check(bundle.json)).toBe(true);
    const served = await bundler.serve(bundle.entries[0].mount);
    expect(served.text).toContain("innerHTML");
  });

  it("prune removes every hash-named build without its source; a surface's named bundle and every sourced page stay", async () => {
    const root = await Deno.makeTempDir({ dir: directory, prefix: "prune-" });
    const pruning = paladin.bundler(`${root}/bundles/game/board`);
    const entry = `${root}/Board.svelte`;
    await Deno.writeTextFile(entry, SOURCE);
    const stale = (await pruning.bundle({ mime: mime.dom.svelte, entry })).entries[0];
    await Deno.utime(`${pruning.directory}/bundle${stale.mount}`, 1, 1);
    await Deno.writeTextFile(entry, SOURCE.replace("18", "20"));
    const current = (await pruning.bundle({ mime: mime.dom.svelte, entry })).entries[0];
    const page = (await pruning.bundle({ mime: mime.dom.html, source: "<h1>page</h1>" })).entries[0];
    await Deno.utime(`${pruning.directory}/bundle${page.mount}`, 1, 1);
    const named = (await paladin.bundler(pruning.directory, root).bundle({ mime: mime.dom.svelte, mount: "Board.svelte", name: "bundle/board.dom.svelte.mjs" })).bundle.entries[0];

    expect((await paladin.bundler.under(root)).map((held) => held.directory)).toEqual([pruning.directory]);

    const dry = await pruning.prune({ dry: true });
    expect(dry.kept).toBe(1);
    expect(dry.removed.map((held) => held.name).sort()).toEqual([stale.mount.slice(1), current.mount.slice(1)].sort());
    expect(await pruning.serve(stale.mount)).not.toBe(null);

    const pruned = await pruning.prune();
    expect(pruned.removed).toEqual(dry.removed);
    expect(pruned.bytes).toBe(dry.removed.reduce((sum, held) => sum + held.bytes, 0));
    expect(await pruning.serve(stale.mount)).toBe(null);
    expect(await pruning.serve(current.mount)).toBe(null);
    expect(await pruning.serve(page.mount)).not.toBe(null);
    expect((await Deno.stat(`${pruning.directory}${named.mount}`)).isFile).toBe(true);
    expect((await pruning.prune()).removed).toEqual([]);
    expect((await paladin.bundler(`${root}/absent`).prune()).kept).toBe(0);
  });

  it("refuses what it must", async () => {
    const refused = async (fn) => {
      try {
        await fn();
        return false;
      } catch {
        return true;
      }
    };

    expect(await refused(() => bundler.bundle({ mime: mime.dom.svelte, source: "" }))).toBe(true);
    expect(await refused(() => bundler.bundle({ mime: mime.tty.solid, source: "<box/>" }))).toBe(true);
    expect(await refused(() => bundler.bundle({ mime: mime.dom.svelte }))).toBe(true);
    expect(await refused(() => bundler.bundle({ mime: mime.dom.svelte, source: "<script>let { = $props();</script>" }))).toBe(true);
    expect(await refused(() => bundler.inspect("f".repeat(64)))).toBe(true);

    const names = ["/../secrets", "/x.mjs", "/deadbeefdeadbeef.mjs", "/deadbeefdeadbeef.dom.svelte", `/${"0".repeat(16)}.svelte.mjs`, `/${"0".repeat(16)}.tty.solid.mjs`];
    for (const name of names) expect(await bundler.serve(name)).toBe(null);
    expect(await bundler.serve(`/${"0".repeat(16)}.dom.svelte.mjs`)).toBe(null);
  });
});

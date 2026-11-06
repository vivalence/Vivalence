import { describe, it, beforeAll, afterAll } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { v, crypto, mime } from "@vivalence/typology";
import esbuild from "esbuild";
import paladin from "../mod.js";

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
  'import { Field } from "@vivalence/drapes/dom/Field.jsx";',
  "",
  "const App = (props) => {",
  "  const [size, setSize] = createSignal(18);",
  "  return (",
  '    <div class="spawned" style={{ "font-size": `${size()}px` }}>',
  "      <h1>{props.buffer.data.title}</h1>",
  '      <Field label="size"><button onClick={() => setSize(size() + 2)}>A+</button></Field>',
  "    </div>",
  "  );",
  "};",
  "",
  "export default (element, props) => {",
  "  const dispose = render(() => <App {...props} />, element);",
  "  return { destroy: dispose };",
  "};",
].join("\n");

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

    expect(artifact).not.toMatch(/^import .* from "(?!\.|\/)/m);
    expect(artifact).toContain("document.createElement");
    expect(artifact).toContain("kit-field");
    expect(artifact).not.toContain("@opentui");
    expect(artifact).toMatch(/as default/);

    const served = await bundler.serve(bundle.entries[0].mount);
    expect(served.text).toBe(artifact);
    expect(await bundler.inspect(hash)).toEqual({ hash, source: SOLID });

    const entry = `${directory}/Reader.jsx`;
    await Deno.writeTextFile(entry, SOLID);
    const again = await bundler.bundle({ mime: mime.dom.solid, entry });
    expect(again.entries[0].mount).toMatch(/\.dom\.solid\.mjs$/);
    expect((await bundler.serve(again.entries[0].mount)).text).toContain("document.createElement");
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

  it("prune keeps the newest compiled view and every sourced page", async () => {
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

    expect((await paladin.bundler.under(root)).map((held) => held.directory)).toEqual([pruning.directory]);

    const dry = await pruning.prune({ dry: true });
    expect(dry.kept).toBe(2);
    expect(dry.removed.map((held) => held.name)).toEqual([stale.mount.slice(1)]);
    expect(await pruning.serve(stale.mount)).not.toBe(null);

    const pruned = await pruning.prune();
    expect(pruned.removed).toEqual(dry.removed);
    expect(pruned.bytes).toBe(dry.removed[0].bytes);
    expect(await pruning.serve(stale.mount)).toBe(null);
    expect(await pruning.serve(current.mount)).not.toBe(null);
    expect(await pruning.serve(page.mount)).not.toBe(null);
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

import { describe, it, beforeAll, afterAll } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { v, crypto } from "@vivalence/typology";
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

  it("a svelte source bundles to a content-addressed View", async () => {
    const view = await bundler.bundle({ kind: "svelte", source: SOURCE });
    const hash = await crypto.digest(SOURCE);
    const stem = hash.slice(0, 16);

    expect(await Deno.readTextFile(`${directory}/bundle/${stem}.svelte`)).toBe(SOURCE);
    const artifact = await Deno.readTextFile(`${directory}/bundle/${stem}.svelte.mjs`);
    expect(artifact).toContain("as default");
    expect(view.json).toEqual({
      kind: "svelte",
      hash,
      mount: `/${stem}.svelte.mjs`,
      bundle: {
        entries: [
          { type: "js", mount: `/${stem}.svelte.mjs`, integrity: await crypto.digest(artifact), bytes: artifact.length },
        ],
      },
    });
    expect(v.prototypes.View().check(view.json)).toBe(true);

    const stat = await Deno.stat(`${directory}/bundle/${stem}.svelte.mjs`);
    const again = await bundler.bundle({ kind: "svelte", source: SOURCE });
    expect(again.json).toEqual(view.json);
    expect((await Deno.stat(`${directory}/bundle/${stem}.svelte.mjs`)).mtime).toEqual(stat.mtime);

    const served = await bundler.serve(`/${stem}.svelte.mjs`);
    expect(served.text).toBe(artifact);
    expect(served.type).toBe("application/javascript");
    expect(served.integrity).toBe(view.bundle.entries[0].integrity);

    expect(await bundler.inspect(hash)).toEqual({ hash, source: SOURCE });
  });

  it("an on-disk entry bundles the same way (the app path)", async () => {
    const entry = `${directory}/Reader.svelte`;
    await Deno.writeTextFile(entry, SOURCE);
    const view = await bundler.bundle({ kind: "svelte", entry });

    expect(view.kind).toBe("svelte");
    expect(v.prototypes.View().check(view.json)).toBe(true);
    const served = await bundler.serve(view.mount.nature);
    expect(served.integrity).toBe(view.bundle.entries[0].integrity);
    expect(served.text).toContain("as default");
  });

  it("an html source wraps into a module", async () => {
    const view = await bundler.bundle({ kind: "html", source: "<h1>plain</h1>" });
    expect(view.kind).toBe("html");
    expect(v.prototypes.View().check(view.json)).toBe(true);
    const served = await bundler.serve(view.mount.nature);
    expect(served.text).toContain("innerHTML");
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

    expect(await refused(() => bundler.bundle({ kind: "svelte", source: "" }))).toBe(true);
    expect(await refused(() => bundler.bundle({ kind: "react", source: "<p>hi</p>" }))).toBe(true);
    expect(await refused(() => bundler.bundle({ kind: "svelte" }))).toBe(true);
    expect(await refused(() => bundler.bundle({ kind: "svelte", source: "<script>let { = $props();</script>" }))).toBe(true);
    expect(await refused(() => bundler.inspect("f".repeat(64)))).toBe(true);

    const names = ["/../secrets", "/x.mjs", "/deadbeefdeadbeef.mjs", "/deadbeefdeadbeef.svelte", `/${"0".repeat(16)}.react.mjs`];
    for (const name of names) expect(await bundler.serve(name)).toBe(null);
    expect(await bundler.serve(`/${"0".repeat(16)}.svelte.mjs`)).toBe(null);
  });
});

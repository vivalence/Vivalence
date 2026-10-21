import { specimen, crypto, mime } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import esbuild from "esbuild";
import { mountMode } from "@vivalence/runtime/scenarios";
import { FileEntity, ViewEntity } from "@vivalence/runtime";
import * as reader from "../../../commons/playground/chaosmonkey/reader/reader.viva.js";

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

let scenario;
let mode;
let directory;
let bundler;

specimen.describe("views bundled through the repository verb", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await mountMode(reader);
    mode = scenario.mode;
    directory = await Deno.makeTempDir({
      dir: new URL("./", import.meta.url).pathname,
      prefix: "spawned-",
    });
    bundler = paladin.bundler(directory);
  });
  specimen.afterAll(async () => {
    await esbuild.stop();
    await Deno.remove(directory, { recursive: true });
    await scenario.orm.close();
  });

  specimen.it("a source bundles to a View row whose Files are the kept source and the content-addressed compile; entry names the compile", async () => {
    const view = await scenario.scoped(async (em) => {
      const row = await scenario.daemon.entities.view.bundle({ mode: mode.entity.id, slug: "spawned", mime: mime.dom.svelte, source: SOURCE }, { bundler });
      return await em.fork().findOneOrFail(ViewEntity, { id: row.id }, { populate: ["files"] });
    });
    const hash = await crypto.digest(SOURCE);
    const stem = hash.slice(0, 16);
    const artifact = await Deno.readTextFile(`${directory}/bundle/${stem}.dom.svelte.mjs`);

    specimen.expect([view.slug, view.mime, view.entry]).toEqual(["spawned", mime.dom.svelte, `bundle/${stem}.dom.svelte.mjs`]);
    const files = view.files.getItems().sort((a, b) => (a.path < b.path ? -1 : 1));
    specimen.expect(files.map((file) => [file.path, file.mime, file.mount])).toEqual([
      [`bundle/${stem}.dom.svelte`, mime.dom.svelte, `${directory}/bundle/${stem}.dom.svelte`],
      [`bundle/${stem}.dom.svelte.mjs`, mime.javascript, `${directory}/bundle/${stem}.dom.svelte.mjs`],
    ]);
    specimen.expect(files[0].hash).toBe(hash);
    specimen.expect(files[0].integrity).toBe(`sha256-${hash}`);
    specimen.expect(files[1].hash).toBe(await crypto.digest(artifact));
    specimen.expect(files[1].integrity).toBe(`sha256-${await crypto.digest(artifact)}`);
    specimen.expect(files[1].bytes).toBe(artifact.length);
    specimen.expect(await Deno.readTextFile(files[0].mount)).toBe(SOURCE);
  });

  specimen.it("the same (mode, slug, mime) again is the SAME row: new Files, the old ones pruned", async () => {
    const before = await scenario.scoped((em) => em.fork().findOneOrFail(ViewEntity, { slug: "spawned" }));
    const revised = SOURCE.replace("A+", "A++");
    const view = await scenario.scoped(async (em) => {
      const row = await scenario.daemon.entities.view.bundle({ mode: mode.entity.id, slug: "spawned", mime: mime.dom.svelte, source: revised }, { bundler });
      return await em.fork().findOneOrFail(ViewEntity, { id: row.id }, { populate: ["files"] });
    });
    const stem = (await crypto.digest(revised)).slice(0, 16);
    specimen.expect(view.id).toBe(before.id);
    specimen.expect(view.entry).toBe(`bundle/${stem}.dom.svelte.mjs`);
    specimen.expect(view.files.getItems().map((file) => file.path).sort()).toEqual([`bundle/${stem}.dom.svelte`, `bundle/${stem}.dom.svelte.mjs`]);
    specimen.expect(await scenario.scoped((em) => em.fork().count(FileEntity, { view: view.id }))).toBe(2);
    specimen.expect(await scenario.scoped((em) => em.fork().count(ViewEntity, { slug: "spawned" }))).toBe(1);
  });

  specimen.it("a buffer carries no bundle (m87 ruling 20): the row round-trips with its data and the json kind", async () => {
    await scenario.scoped(async (em) => {
      const buffer = await scenario.daemon.entities.buffer.create({
        mode: mode.entity.id,
        data: { title: "Spawned" },
        thread: scenario.fixtures.thread.id,
      });
      await em.flush();

      specimen.expect(buffer.data.title).toBe("Spawned");
      specimen.expect(buffer.thread.id).toBe(scenario.fixtures.thread.id);
      specimen.expect(buffer.mime).toBe(mime.json);

      em.clear();
      const row = await em.findOne(buffer.constructor, { id: buffer.id });
      specimen.expect(row.mime).toBe(mime.json);
      specimen.expect(row.data).toEqual({ title: "Spawned" });
      specimen.expect("bundle" in row).toBe(false);
    });
  });
});

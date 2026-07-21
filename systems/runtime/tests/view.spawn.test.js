import { specimen, crypto, v } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import esbuild from "esbuild";
import { mountMode } from "@vivalence/runtime/scenarios";
import { tiers } from "./scenarios/fixtures.js";
import * as reader from "../../../registry/playground/modes/chaosmonkey/reader/reader.viva.js";

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

specimen.describe("generative views", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await mountMode(reader);
    mode = scenario.mode;
    directory = await Deno.makeTempDir({
      dir: new URL("./", import.meta.url).pathname,
      prefix: "spawned-",
    });
    bundler = paladin.bundler(directory);
    mode.gen = {
      bundle: bundler.bundle,
      inspect: bundler.inspect,
      serve: bundler.serve,
      buffer: async ({ view, data = {}, thread = null }) => {
        const buffer = scenario.daemon.entities.em.create(tiers.buffer.entity, {
          mode: mode.entity.id,
          data,
          view: view.json,
          index: 0,
        });
        if (thread) {
          const found = await scenario.daemon.entities.thread.findOne(thread);
          buffer.thread = found;
          buffer.index = found.counter++;
        }
        return buffer;
      },
    };
  });
  specimen.afterAll(async () => {
    await esbuild.stop();
    await Deno.remove(directory, { recursive: true });
    await scenario.orm.close();
  });

  specimen.it("a source bundles to a content-addressed view on the row schematic", async () => {
    const view = await mode.gen.bundle({ kind: "svelte", source: SOURCE });
    const hash = await crypto.digest(SOURCE);
    const stem = hash.slice(0, 16);

    const artifact = await Deno.readTextFile(`${directory}/bundle/${stem}.svelte.mjs`);
    specimen.expect(view.json).toEqual({
      kind: "svelte",
      hash,
      mount: `/${stem}.svelte.mjs`,
      bundle: {
        entries: [
          { type: "js", mount: `/${stem}.svelte.mjs`, integrity: await crypto.digest(artifact), bytes: artifact.length },
        ],
      },
    });
    specimen.expect(v.prototypes.View().check(view.json)).toBe(true);

    const served = await mode.gen.serve(view.mount.nature);
    specimen.expect(served.text).toBe(artifact);
    specimen.expect(served.integrity).toBe(view.bundle.entries[0].integrity);
    specimen.expect(await mode.gen.inspect(hash)).toEqual({ hash, source: SOURCE });
  });

  specimen.it("a buffer carries its view pointer through the ORM round-trip", async () => {
    await scenario.scoped(async (em) => {
      const view = await mode.gen.bundle({ kind: "svelte", source: SOURCE });
      const buffer = await mode.gen.buffer({
        view,
        data: { title: "Spawned" },
        thread: scenario.fixtures.thread.id,
      });
      await em.flush();

      specimen.expect(buffer.view.hash).toBe(await crypto.digest(SOURCE));
      specimen.expect(buffer.data.title).toBe("Spawned");
      specimen.expect(buffer.thread.id).toBe(scenario.fixtures.thread.id);
      specimen.expect(v.prototypes.View().check(buffer.view)).toBe(true);

      em.clear();
      const row = await em.findOne(buffer.constructor, { id: buffer.id });
      specimen.expect(row.view).toEqual(buffer.view);
    });
  });
});

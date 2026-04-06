import { specimen, BufferView, Path } from "@vivalence/typology";
import { bundle } from "@vivalence/typology";
const { svelte } = bundle;
import esbuild from "esbuild";
import { join } from "@std/path";

const fixturesDir = new URL("../scenarios/fixtures/", import.meta.url);
const fixturesPath = new URL(".", fixturesDir).pathname;

specimen.describe("bundle", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.afterAll(async () => {
    await esbuild.stop();
  });

  specimen.describe("svelte bundler", () => {
    specimen.it("bundles a .svelte entry with auto-pack", async () => {
      const entry = join(fixturesPath, "test-component.svelte");
      const outputFiles = await svelte(entry, { prod: false });
      specimen.expect(outputFiles.length).toBe(1);
      specimen.expect(outputFiles[0].text.length).toBeGreaterThan(0);
      specimen.expect(outputFiles[0].text).toContain("as default");
      specimen.expect(outputFiles[0].text).toContain("mount");
      specimen.expect(outputFiles[0].path).toBe(entry);
    });
  });

  specimen.describe("BufferView pipeline", () => {
    specimen.it("bundles and serves a .svelte entry", async () => {
      const bv = new BufferView("test-component.svelte");
      bv.path.from(new Path(fixturesPath));
      bv.withBundler((entry) => svelte(entry, { prod: false }));
      await bv.bundle();

      specimen.expect(bv.bundled).toBe(true);
      const result = bv.serve("test-component.svelte");
      specimen.expect(result.text).toContain("mount");
      specimen.expect(result.text).toContain("as default");
      specimen.expect(result.response.type).toBe("application/javascript");
    });

    specimen.it("supports object constructor { mount, schema }", async () => {
      const bv = new BufferView({ mount: "test-component.svelte", schema: {} });
      bv.path.from(new Path(fixturesPath));
      bv.withBundler((entry) => svelte(entry, { prod: false }));
      await bv.bundle();

      specimen.expect(bv.bundled).toBe(true);
      specimen.expect(bv.serve("test-component.svelte").text).toContain("as default");
    });
  });
});

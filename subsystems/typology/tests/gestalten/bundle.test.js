import { specimen, App, Path } from "@vivalence/typology";
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

  specimen.describe("App pipeline", () => {
    specimen.it("bundles and serves a .svelte entry", async () => {
      const bv = new App("test-component.svelte");
      bv.mount.from(new Path(fixturesPath));
      bv.withBundler((entry) => svelte(entry, { prod: false }));
      await bv.bundle.compile();

      specimen.expect(bv.bundle.bundled).toBe(true);
      const result = bv.bundle.serve("test-component.svelte");
      specimen.expect(result.text).toContain("mount");
      specimen.expect(result.text).toContain("as default");
      specimen.expect(result.response.type).toBe("application/javascript");
    });

    specimen.it("supports object constructor { mount, schema }", async () => {
      const bv = new App({ mount: "test-component.svelte", mask: {} });
      bv.mount.from(new Path(fixturesPath));
      bv.withBundler((entry) => svelte(entry, { prod: false }));
      await bv.bundle.compile();

      specimen.expect(bv.bundle.bundled).toBe(true);
      specimen.expect(bv.bundle.serve("test-component.svelte").text).toContain("as default");
    });
  });
});

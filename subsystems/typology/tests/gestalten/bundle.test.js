import { specimen, bundle } from "@vivalence/typology";
import esbuild from "esbuild";
import { join } from "@std/path";

const fixturesPath = new URL("../scenarios/fixtures/", import.meta.url).pathname;

specimen.describe("bundle", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.afterAll(async () => {
    await esbuild.stop();
  });

  specimen.it("a svelte entry bundles with auto-pack", async () => {
    const entry = join(fixturesPath, "test-component.svelte");
    const outputFiles = await bundle.svelte(entry, { prod: false });
    specimen.expect(outputFiles.length).toBe(1);
    specimen.expect(outputFiles[0].text.length).toBeGreaterThan(0);
    specimen.expect(outputFiles[0].text).toContain("as default");
    specimen.expect(outputFiles[0].text).toContain("mount");
    specimen.expect(outputFiles[0].path).toBe(entry);
  });
});

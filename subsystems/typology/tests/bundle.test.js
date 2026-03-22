import { specimen } from "@vivalence/typology";
import { bundle } from "@vivalence/typology";
const { svelte } = bundle;
import esbuild from "esbuild";
import { join } from "@std/path";

const fixturesDir = new URL("./scenarios/fixtures/", import.meta.url);

specimen.describe("bundle", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.afterAll(async () => {
    await esbuild.stop();
  });

  specimen.describe("svelte", () => {
    specimen.it("produces ESM output from a Svelte component", async () => {
      const entry = join(new URL(".", fixturesDir).pathname, "test-component.svelte.js");
      const outputFiles = await svelte(entry, { prod: false });
      specimen.expect(outputFiles.length).toBeGreaterThan(0);
      specimen.expect(outputFiles[0].text).toContain("export");
    });
  });
});

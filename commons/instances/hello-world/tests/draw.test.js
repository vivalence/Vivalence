import { specimen } from "@vivalence/typology";
import { external, refuse } from "../page/draw.js";

// the whole point of the guard: esbuild leaves an https: specifier EXTERNAL, so the artifact
// ships it past the integrity hash and the browser executes it at mount. every form esbuild
// passes through has to be caught, not just `from`.
const CLEAN = `<script>
  import { onMount } from "svelte";
  import { Markdown } from "@vivalence/drapes";
  let { buffer, terminal } = $props();
</script>

<article class="page"><h1>{buffer.data.title}</h1></article>

<style>
  .page { height: 100%; overflow-y: auto; background: var(--colors-skeleton-0-surface); }
</style>`;

specimen.describe(
  "P-noexternal: a drawn component may not import from a URL",
  () => {
    specimen.it(
      "refuses every import form esbuild would leave external",
      () => {
        const forms = [
          `import zod from "https://esm.sh/zod@3";`,
          `import "https://esm.sh/side-effect";`,
          `const zod = await import("https://esm.sh/zod@3");`,
          `export * from "https://esm.sh/zod@3";`,
          `import zod from 'https://esm.sh/zod@3';`,
          `import zod from "http://esm.sh/zod@3";`,
          `import {\n  z,\n} from   "https://esm.sh/zod@3";`,
          `const m = await import (\n  "https://esm.sh/zod@3"\n);`,
        ];
        for (const form of forms) {
          specimen.expect(external(form)).toBe(true);
          specimen.expect(() => refuse(form)).toThrow();
        }
      },
    );

    specimen.it("passes a clean component through unchanged", () => {
      specimen.expect(external(CLEAN)).toBe(false);
      specimen.expect(refuse(CLEAN)).toBe(CLEAN);
    });

    specimen.it(
      "does not fire on a URL that is only ever text — an href, a comment, a string",
      () => {
        const innocent = [
          `<a href="https://en.wikipedia.org/wiki/Flamingo">source</a>`,
          `// see https://esm.sh for why this is refused`,
          `const url = "https://example.com/article";`,
          `<Markdown text={"read https://deno.land"} />`,
        ];
        for (const form of innocent) {
          specimen.expect(external(form)).toBe(
            false,
          );
        }
      },
    );

    specimen.it("names what the model must change", () => {
      let message = "";
      try {
        refuse(`import x from "https://esm.sh/x";`);
      } catch (error) {
        message = error.message;
      }
      specimen.expect(message).toContain("may not import from a URL");
    });
  },
);

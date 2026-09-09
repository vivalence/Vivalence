import { parseHTML } from "npm:linkedom@0.18.5";
import { specimen } from "@vivalence/typology";
import { skeleton } from "../skeleton.js";

const page = Deno.readTextFileSync(
  new URL("./fixtures/deno-docs.html", import.meta.url),
);
const map = () => {
  const { document } = parseHTML(page);
  return skeleton(document.body).join("\n");
};

specimen.describe("skeleton — structure without the text", () => {
  specimen.it(
    "P-map: the article's node is findable, with its paragraph count",
    () => {
      const lines = map();
      specimen.expect(lines).toContain("main#content.prose");
      specimen.expect(/main#content\.prose chars=\d+ p=[1-9]/.test(lines)).toBe(
        true,
      );
    },
  );

  specimen.it("P-notext: no sentence of the page survives into the map", () => {
    const lines = map();
    // three phrases that are certainly IN the page, in prose, nav and footer.
    specimen.expect(lines.includes("secure by default")).toBe(false);
    specimen.expect(lines.includes("Permissions")).toBe(false);
    specimen.expect(lines.includes("Deno authors")).toBe(false);
    // what IS there is tags, ids, classes and counts.
    specimen.expect(/^[a-z0-9#.\-\s=p]+$/im.test(lines.split("\n")[0])).toBe(
      true,
    );
  });

  specimen.it(
    "P-furniture: nav and footer are described too — the model must tell them apart",
    () => {
      const lines = map();
      specimen.expect(lines).toContain("header#masthead.site-header");
      specimen.expect(lines).toContain("footer#site-footer.footer");
      // the discriminator the CHOOSE prompt leans on: furniture holds text but no paragraphs.
      const nav = lines.split("\n").find((line) =>
        line.includes("nav#primary")
      );
      if (nav) specimen.expect(nav).toContain("p=0");
    },
  );

  specimen.it(
    "script and style are never described, whatever they weigh",
    () => {
      const lines = map();
      specimen.expect(lines.includes("script")).toBe(false);
      specimen.expect(lines.includes("style")).toBe(false);
    },
  );

  specimen.it(
    "P-frugal: the whole map is small enough to spend on every read",
    () => {
      const lines = map();
      // the number this exists to hold down. a map that grows past a few hundred chars costs
      // more than the answer it buys.
      specimen.expect(lines.length < 900).toBe(true);
      specimen.expect(lines.split("\n").length < 20).toBe(true);
    },
  );

  specimen.it(
    "a node with no children maps to nothing rather than throwing",
    () => {
      const { document } = parseHTML("<html><body></body></html>");
      specimen.expect(skeleton(document.body)).toEqual([]);
    },
  );
});

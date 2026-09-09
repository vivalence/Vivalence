import { join } from "@std/path";
import { parseHTML } from "npm:linkedom@0.18.5";
import { specimen } from "@vivalence/typology";
import { skeleton } from "../skeleton.js";
import { extract } from "../extract.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

const pin = (subject, file) => {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    specimen.snapshot(pojo, {
      base: SNAPSHOTS,
      locate: file,
      parse: (value) => value,
    });
  }
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
};

const BASE = new URL("https://docs.deno.com/runtime/fundamentals/permissions/");
const page = Deno.readTextFileSync(
  new URL("./fixtures/deno-docs.html", import.meta.url),
);

specimen.describe(
  "reader page snapshot — what the model sees, and what it gets back",
  () => {
    specimen.it(
      "S2: one committed fixture through skeleton and extract, no network anywhere",
      () => {
        const { document } = parseHTML(page);
        const map = skeleton(document.body).join("\n");
        const article = extract(document, "main#content", BASE);

        const pinned = pin(
          {
            // the model's INPUT. if this degrades, P-selector degrades and no assertion notices.
            skeleton: map,
            skeletonChars: map.length,
            // the model's OUTPUT, as the tool returns it.
            chars: article.chars,
            truncated: article.truncated,
            matched: article.matched,
            links: article.links.slice(0, 5),
            markdown: article.markdown.slice(0, 400),
          },
          "reader-page.snapshot.json",
        );

        // the two claims the snapshot exists to keep honest, said out loud as well as pinned.
        specimen.expect(pinned.skeleton).toContain("main#content.prose");
        specimen.expect(pinned.skeleton.includes("secure by default")).toBe(
          false,
        );
      },
    );
  },
);

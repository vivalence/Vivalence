import { parseHTML } from "npm:linkedom@0.18.5";
import { drink, hop } from "./hop.js";
import { skeleton } from "./skeleton.js";
import { extract } from "./extract.js";

const manifest = {
  type: "service",
  slug: "reader",
  name: "Reader",
  description:
    "Fetch a web page, describe its structure, and extract any node of it as markdown.",
  version: "0.0.1",
  traits: [],
};

// no cortex, no model, no prompt. the caller decides WHICH node; this only knows how to
// fetch one safely, describe what is there, and cut a node out.
function provider() {
  return {
    // options are injected only by the tests — the daemon calls open(url) and nothing else.
    open: async (url, options) => {
      const { response, target } = await hop(url, options);
      // drink() consumes the stream, so what it returns is the ONLY copy of the page there
      // will ever be. keep it, with the status and headers that came with it.
      const { body, bytes, capped } = await drink(response);
      const { document } = parseHTML(body);
      const root = document.body ?? document;
      const map = skeleton(root);
      const title = document.title ?? "";

      return {
        url: target.href,
        status: response.status,
        headers: Object.fromEntries(response.headers),
        title,
        body,
        bytes,
        capped,
        document,
        skeleton: map.join("\n"),
        extract: (selector) => extract(document, selector, target),
      };
    },
  };
}

export { manifest, provider };

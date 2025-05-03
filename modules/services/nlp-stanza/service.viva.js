import client from "./client/index.js";
import boot from "./server/mod.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
};

export { manifest, boot, client };

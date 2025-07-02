import client from "./client/index.js";
import server from "./server/mod.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
};

export { manifest, server, client };

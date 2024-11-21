import client from "./client/index.js";
import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
};

export { manifest, client, service };

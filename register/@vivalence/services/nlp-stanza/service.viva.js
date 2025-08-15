import client from "./client/index.js";
import control from "./server/mod.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
  traits: ["STANDALONE"],
};

// const server/container = {
//   dockerfile: { path: "./server/Dockerfile" },
//   compose: { path: "./server/docker-compose.yml" },
//   env: { template: { path: "" } },
// };

export { manifest, control, client };

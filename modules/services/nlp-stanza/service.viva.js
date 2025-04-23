import client from "./client/index.js";
// import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
};

async function boot(host) {
  host.trajectory.path("/create", () => {
    console.log("created nlp service");
  });
}

export { manifest, boot, client };

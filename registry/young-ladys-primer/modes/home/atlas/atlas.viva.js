import { App } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "atlas",
  name: "Atlas",
  description: "Everything a child learns. The curriculum as a constellation of concepts, each tethered to what must come before it.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

const app = new App("Atlas.svelte");

export { manifest, app };

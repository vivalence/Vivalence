import { App, v } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "dataspace",
  name: "Dataspace",
  description: "Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

const app = new App("Dashboard.svelte");

export { manifest, app };

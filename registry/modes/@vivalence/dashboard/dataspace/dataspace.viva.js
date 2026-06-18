import { View, v } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "dataspace",
  name: "Dataspace",
  description: "Live dataspace viewer. Literal corpus map, memory landscape, trace timeline.",
  version: "0.1.0",
  traits: ["VIEWABLE", "STANDALONE"],
};

const view = new View("Dashboard.svelte");

export { manifest, view };

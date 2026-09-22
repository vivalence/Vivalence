import { App, v } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "dataspace",
  name: "Dataspace",
  description:
    "The daemon's dataspace as a workbench. The catalog is the datamap, the doors are the query, " +
    "a relation cell is a jump, and /subscribe is the live cursor. Grid with a where-builder and a raw " +
    "body, an editable row inspector, and the schema as an ER canvas.",
  version: "0.2.0",
  traits: ["APPLICATION", "STANDALONE"],
};

const application = new App("Dashboard.svelte");

export { manifest, application };

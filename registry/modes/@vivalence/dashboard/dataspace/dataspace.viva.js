import { BufferView, v } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "dataspace",
  name: "Dataspace",
  description: "Live dataspace viewer. Literal topology, memory landscape, trace timeline.",
  version: "0.1.0",
  traits: ["BUFFERED", "SELFEVIDENT"],
};

const buffer = new BufferView("buffer/Dashboard.svelte", v.buffer({ data: {} }));

export { manifest, buffer };

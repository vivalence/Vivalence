import { mime } from "@vivalence/typology";

export { aperture } from "./aperture.js";
export { boot } from "./boot.js";
export { primer } from "./primer.js";
export { tools } from "./tools.js";
export { twitch } from "./twitch.js";

export const manifest = {
  type: "bot",
  slug: "personal",
  name: "Personal",
  description: "One owner's agent, reached from their messengers: it pulls each platform it names.",
  version: "0.1.0",
  traits: ["BOOTED", "HARNESS", "TOOLING", "SURFACED", "EXPOSED", "TWITCHY", "PRIMER"],
};

export const statics = { platforms: ["whatsapp"], idle: 21600 };

export const surfaces = [{ slug: "desk", mount: "desk/Desk.svelte", mime: mime.dom.svelte }];

export { boot } from "./boot.js";

export const manifest = {
  type: "bot",
  slug: "personal",
  name: "Personal",
  description: "One owner's agent, reached from their messengers: it pulls each platform it names.",
  version: "0.1.0",
  traits: ["BOOTED"],
};

export const statics = { platforms: ["whatsapp"], idle: 21600 };

export { attachment } from "./attachment.js";
export { provider } from "./provider.js";

export const manifest = {
  type: "service",
  slug: "whatsapp",
  name: "WhatsApp",
  description:
    "One WhatsApp number of the Cloud API: its webhook, hosted, hands every signed delivery on; " +
    "consumed, it yields the owner's messages and sends text.",
  version: "0.1.0",
  traits: ["ATTACHED"],
};

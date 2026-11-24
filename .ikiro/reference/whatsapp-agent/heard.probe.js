import { v } from "@vivalence/typology";
import { Message } from "../../../commons/social/schematics.js";
import { heard } from "./social/whatsapp/heard.js";

const fetched = async (id) => ({ data: btoa(`bytes of ${id}`), mime: { 778: "audio/ogg; codecs=opus", 901: "image/jpeg", 902: "video/mp4", 903: "application/pdf" }[id] });
const wrap = (value) => ({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value }] }] });
const base = { from: "4915100000000", timestamp: "1732440000" };
const contacts = [{ profile: { name: "Finn" }, wa_id: "4915100000000" }];

const messages = await heard(wrap({ messaging_product: "whatsapp", contacts, messages: [
  { ...base, id: "wamid.A", type: "text", text: { body: "hi" } },
  { ...base, id: "wamid.B", type: "audio", audio: { id: "778", mime_type: "audio/ogg; codecs=opus", voice: true } },
  { ...base, id: "wamid.C", type: "image", image: { id: "901", mime_type: "image/jpeg", caption: "the receipt" } },
  { ...base, id: "wamid.H", type: "video", video: { id: "902", mime_type: "video/mp4" } },
  { ...base, id: "wamid.I", type: "document", document: { id: "903", mime_type: "application/pdf", filename: "report.pdf", caption: "q3" } },
  { ...base, id: "wamid.D", type: "text", text: { body: "this one" }, context: { from: "15550001111", id: "wamid.A" } },
  { ...base, id: "wamid.E", type: "reaction", reaction: { message_id: "wamid.A", emoji: "👍" } },
  { ...base, id: "wamid.F", type: "location", location: { latitude: 52.52, longitude: 13.405, name: "Berlin" } },
  { ...base, id: "wamid.G", type: "unsupported", errors: [{ code: 131051, title: "Message type unknown" }] },
] }), "4915100000000", fetched);
for (const message of messages) console.log(JSON.stringify(message), JSON.stringify(v.faults(Message, message)));
console.log(JSON.stringify(await heard(wrap({ messaging_product: "whatsapp", statuses: [{ id: "wamid.OUT", status: "delivered" }] }), "4915100000000", fetched)));

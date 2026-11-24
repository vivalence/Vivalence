import { v } from "@vivalence/typology";
import { Message } from "./dogma.probe.js";

console.log(JSON.stringify(v.faults(Message, { platform: "telegram" })));
console.log(JSON.stringify(v.faults(Message, { platform: "whatsapp", id: "wamid.HBgN", from: "4915100000000", name: "Finn", at: 1732440000, type: "audio", media: "778" })));

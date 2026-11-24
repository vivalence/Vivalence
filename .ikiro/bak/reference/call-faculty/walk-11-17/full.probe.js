import { pour } from "./pour2.probe.js";
let open = { role: "user", id: "turn-2", parts: [{ type: "text", text: "poi " }] };
open = pour(open, { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." }, turn: "turn-1" });
console.log(JSON.stringify(open));

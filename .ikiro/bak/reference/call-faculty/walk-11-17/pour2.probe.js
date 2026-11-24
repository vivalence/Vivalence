export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
    case "/part/open":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "/part/delta": {
      const part = turn.parts[packet.index];
      for (const [key, value] of Object.entries(packet.part)) {
        part[key] =
          typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
      }
      delete part.draft;
      break;
    }
    case "/part/draft":
      turn.parts[packet.index].draft = packet.part;
      break;
    case "/part/full":
      turn.parts[packet.index] = { ...packet.part };
      break;
    case "/part/close": {
      const part = turn.parts[packet.index];
      delete part.draft;
      if (part?.type === "tool_use" && typeof part.input === "string")
        part.input = part.input ? JSON.parse(part.input) : {};
      break;
    }
    case "/turn/close":
      turn.meta = packet.meta;
      break;
    case "/turn/full":
      return packet.turn;
  }
  return turn;
}
let turn = null; if (import.meta.main) {
for (const packet of [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/draft", index: 0, part: { text: "vado al" } },
  { event: "/part/delta", index: 0, part: { text: "vado " } },
  { event: "/part/draft", index: 0, part: { text: "al mer" } },
  { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." } },
  { event: "/part/close", index: 0 },
]) {
  turn = pour(turn, packet);
  console.log(packet.event.padEnd(12), JSON.stringify(turn));
}
let image = pour(null, { event: "/turn/open", turn: { role: "assistant" } });
image = pour(image, { event: "/part/open", index: 0, part: { type: "image", data: "", media: "image/png" } });
image = pour(image, { event: "/part/draft", index: 0, part: { data: "iVBORw0K…step2", media: "image/png" } });
console.log(JSON.stringify(image, null, 2));}

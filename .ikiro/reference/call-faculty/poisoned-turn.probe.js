// limit: 900 chars · the stored interrupted turn of thread 01a1d1b0 through the anthropic translator, as the mind's request carries it
import { translateTurns } from "../../../commons/hallucinators/anthropic/provider/translate.js";

const stored = [
  { role: "user", parts: [{ type: "text", text: "¿Cómo estás?" }] },
  { role: "assistant", parts: [{ type: "thinking", text: "", signature: "" }], meta: { state: "interrupted" } },
  { role: "user", parts: [{ type: "text", text: "" }] },
  { role: "user", parts: [{ type: "text", text: "Hola, Francesca. ¿Cómo estás?" }] },
];
console.log(JSON.stringify(translateTurns(stored).messages, null, 1));

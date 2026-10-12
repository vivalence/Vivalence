import { createInterface } from "node:readline";
import process from "node:process";
import { shape } from "@vivalence/typology";

const GLYPHS = { user: "<< ", assistant: ">>", system: "·" };
const SHOWN = ["message", "fault", "turn"];

const line = (record) => {
  if (record.verb === "fault") return `✕ ${record.data.message}`;
  if (record.verb === "turn" && record.data.role === "user") return null;
  if (record.verb === "turn")
    return `${GLYPHS[record.data.role]} ${record.data.parts.map((part) => (part.type === "text" ? part.text : `[${part.type}]`)).join(" ")}`;
  return `${record.path.split("/").at(-1)} ${typeof record.data === "string" ? record.data : JSON.stringify(record.data)}`;
};

// this is strictly the execution space of the repl. here we dont compose.

export const repl = (clientDie) => {
  const tail = clientDie.controller.stdout.tail(...SHOWN);
  let seen = 0;
  const untail = tail.subscribe((records) => {
    for (const record of records.slice(seen)) {
      const text = line(record);
      if (text !== null) console.log(text);
    }
    seen = records.length;
  });
  console.log(shape.strip(clientDie.repl));

  const reader = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: GLYPHS.user,
  });

  reader.on("line", (text) => clientDie.dispatch(text).finally(() => reader.prompt()));

  reader.prompt();

  return () => {
    untail();
    reader.close();
  };
};

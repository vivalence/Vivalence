import { Vector, steer } from "@vivalence/typology";
import { Legend } from "./legend.target.js";
import { repl } from "/Users/finn/vivalence/code/vivalence/systems/ghost/gestalten/commands/system/repl.js";
import { dictate } from "./dictate.target.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const pressed = async (dictation, catalog) => {
  const sent = [];
  const terminal = {
    mode: null,
    client: { modes: {}, app: { bridge: { dictation } } },
    controller: { stdout: { fault: (error) => sent.push("FAULT " + error.message) } },
    repl: { catalog, commands: new Vector().graft(repl, dictate), dispatch: async (typed) => void sent.push(typed) },
  };
  const legend = new Legend(terminal);
  legend.dispatch("esc");
  await settle();
  return sent;
};
const held = { turns: [], open: null };
for (const [dictation, catalog] of [[null, null], [held, null], [held, []], [null, []]])
  console.log(JSON.stringify({ dictating: dictation !== null, replOpen: catalog !== null, esc: await pressed(dictation, catalog) }));

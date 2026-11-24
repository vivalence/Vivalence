// limit: 1500 chars · who holds esc: the keymap is a graft, the LAST grafted effect wins (systems/ghost/subjects/terminal/legend.js:37)
import { Vector, steer, Signal } from "@vivalence/typology";

const fromRepl = new Vector().open({ nature: "esc", valence: "/repl/close" }, "/repl/close");
const dictating = new Vector().open({ nature: "esc", valence: "/dictate/stop" }, "/dictate/stop");
const closing = new Vector().open({ nature: "esc", valence: "/repl/close" }, "/repl/close");

const held = (dictation, catalog) => {
  const keymap = new Vector().graft(fromRepl, ...(dictation ? [dictating] : []), ...(catalog ? [closing] : []));
  const [effect] = steer.dispatch.traverse(keymap, new Signal("esc"));
  return effect;
};
for (const [dictation, catalog] of [[false, false], [true, false], [true, true], [false, true]])
  console.log(JSON.stringify({ dictating: dictation, replOpen: catalog }), "→", held(dictation, catalog));

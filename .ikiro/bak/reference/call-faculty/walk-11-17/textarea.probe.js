import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { compile, fire, screen, settle } from "/Users/finn/vivalence/code/vivalence/subsystems/drapes/tests/scenarios/index.js";

const result = await esbuild.build({
  entryPoints: ["/Users/finn/vivalence/code/vivalence/.ikiro/reference/call-faculty/walk-11-17/entry.jsx"],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  external: ["@vivalence/typology"],
  nodePaths: ["/Users/finn/vivalence/code/vivalence/node_modules/"],
  plugins: [compile],
  logLevel: "silent",
});
await esbuild.stop();
const directory = await Deno.makeTempDir({ prefix: "call-faculty-dock-" });
await Deno.writeTextFile(directory + "/dock.js", result.outputFiles[0].text);
const dock = await import("file://" + directory + "/dock.js");

const sent = [];
const app = {
  bridge: { $draft: atom("ciao"), $focus: atom("dock.input"), $selected: atom(0), $dictation: atom(null) },
  box: { device: { microphone: { $level: atom(0) } } },
  client: { runtime: { entities: { activity: { $entities: atom([]) } } } },
};
const terminal = {
  $thread: atom(null),
  repl: { $catalog: atom(null), dispatch: async (typed) => void sent.push(typed) },
  legend: { dispatch() {} },
  controller: { stdout: { fault() {} } },
};
const rig = screen(() => dock.Mounted({ app, terminal }), { render: dock.render });
const strip = () => rig.target.querySelector(".dictline");
let mounted = null;
const same = () => { const now = strip(); const kept = mounted === now; mounted = now; return kept; };
const show = async (label) => {
  await settle();
  console.log("--- " + label);
  console.log(strip() ? strip().outerHTML : "no .dictline");
  console.log(JSON.stringify({ sameStrip: same(), field: rig.target.querySelector(".field").className.trim().split(/\s+/), draft: app.bridge.$draft.get(), sent }));
};
await show("nobody dictates");
app.bridge.$dictation.set({ turns: [], open: null });
app.box.device.microphone.$level.set(0.4);
await show("dictating, before a word");
app.bridge.$dictation.set({ turns: [], open: { role: "user", id: "turn-1", parts: [] } });
await show("a turn open, no part yet");
app.bridge.$dictation.set({
  turns: [{ role: "user", id: "turn-1", parts: [{ type: "text", text: "Vado al mercato." }] }],
  open: { role: "user", id: "turn-2", parts: [{ type: "text", text: "poi ", draft: { text: "torno a" } }] },
});
await show("one turn sealed, one open with its draft");
fire(rig.target.querySelector("textarea"), "keydown", { key: "Enter", shiftKey: false });
fire(rig.target.querySelector(".send"), "click");
fire(strip().querySelectorAll("button")[0], "click");
fire(strip().querySelectorAll("button")[1], "click");
await show("Enter, the send key, the strip's stop, the strip's trash");
app.bridge.$dictation.set(null);
sent.length = 0;
fire(rig.target.querySelector("textarea"), "keydown", { key: "Enter", shiftKey: false });
await show("the dictation ended, Enter again");
rig.close();

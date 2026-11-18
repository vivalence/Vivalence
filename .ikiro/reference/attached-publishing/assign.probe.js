// assign.probe.js — what a Mode holds as `twitch` when its MODULE exports one (mode.js:17 the field, :20 Object.assign).
//
//     deno run -A --no-check .ikiro/reference/attached-publishing/assign.probe.js
import { Mode, Twitch, Vector } from "@vivalence/typology";

const manifest = { type: "publish", slug: "attached", version: "0.0.1", traits: ["TWITCHY"] };
const modules = {
  "no twitch export": { manifest },
  "twitch = new Vector()": { manifest, twitch: new Vector() },
  "twitch = new Twitch()": { manifest, twitch: new Twitch() },
};

for (const [name, module] of Object.entries(modules)) {
  const runtime = new Mode({ module, mask: null });
  const daemon = new Mode({ module, mask: null });
  console.log(`\n=== ${name}`);
  console.log("mode.twitch instanceof Twitch      ", runtime.twitch instanceof Twitch);
  console.log("mode.twitch === module.twitch      ", runtime.twitch === module.twitch);
  console.log("two seats of the module share one  ", runtime.twitch === daemon.twitch);
  console.log("typeof mode.twitch.dispatch        ", typeof runtime.twitch.dispatch);
}

import { mountpoints } from "../../../subsystems/paladin/instance/lifecycle/2-resolution.js";
import { Mode, Path } from "@vivalence/typology";

const instance = {
  paladin: { scope: { mountpoint: new Path("/Users/finn/.viva/instances/localhost/mountpoint") } },
  runtime: { manifest: { slug: "house" }, statics: { remote: "http://localhost:2501" }, modes: ["@commons/harness/runtime"] },
  daemons: [{ manifest: { slug: "chess" }, modes: ["@chess/domain/chess"] }],
  services: [],
  clients: [{ manifest: { slug: "viva" }, modes: ["@chess/domain/chess"] }],
};
mountpoints(instance);

console.log("daemon chess · modes[0]");
console.log(JSON.stringify(instance.daemons[0].modes[0], null, 2));
console.log("runtime house · modes[0]");
console.log(JSON.stringify(instance.runtime.modes[0], null, 2));
console.log("client viva · modes[0]");
console.log(JSON.stringify(instance.clients[0].modes[0], null, 2));
for (const mask of [instance.daemons[0].modes[0], instance.runtime.modes[0]]) console.log(JSON.stringify(new Mode(mask), null, 2));

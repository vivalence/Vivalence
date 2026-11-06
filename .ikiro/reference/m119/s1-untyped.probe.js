import { mountpoints } from "../../../subsystems/paladin/instance/lifecycle/2-resolution.js";
import { Path } from "@vivalence/typology";

const instance = {
  paladin: { scope: { mountpoint: new Path("/tmp/m") } },
  daemons: [{ manifest: { slug: "chess" }, modes: ["/pkg/chess/board.viva.js"] }],
  services: [],
  clients: [],
};
mountpoints(instance);
console.log(JSON.stringify(instance.daemons[0].modes[0], null, 2));

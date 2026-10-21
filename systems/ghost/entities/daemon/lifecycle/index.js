import { Vector, shard } from "@vivalence/typology";
import { host } from "../../../gestalten/shard/index.js";

export const execution = new Vector().use(shard.controller.open).use(host.status("daemon")).use(host.metadata("daemon")).use(host.cortex("daemon")).use(host.mounted("daemon")).do(shard.controller.hold);

import { Vector, shard } from "@vivalence/typology";
import { host } from "../../../gestalten/shard/index.js";

export const execution = new Vector().use(shard.controller.open).use(host.status("runtime")).use(host.metadata("runtime")).use(host.cortex("runtime")).use(host.mounted("runtime")).do(shard.controller.hold);

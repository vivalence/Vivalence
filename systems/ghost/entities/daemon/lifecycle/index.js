import { Vector, shard } from "@vivalence/typology";
import { host } from "../../../gestalten/shard/index.js";

export const entities = async (die, next) => {
  die.daemon.entities = die.client.runtime.entities.branch(die.daemon.connection, ["literal", "symbol", "note", "mode"]);
  await next();
};

export const execution = new Vector().use(shard.controller.open).use(host.status("daemon")).use(host.metadata("daemon")).use(entities).use(host.cortex("daemon")).use(host.mounted("daemon")).do(shard.controller.hold);

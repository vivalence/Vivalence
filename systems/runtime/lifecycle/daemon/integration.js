import { Url, Connection, shard, shape } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";

export const call = async (die, next) => {
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(shape.http(die.daemon.aperture)));
  await next();
};

export const prune = async (die, next) => {
  await host.prune(die.host);
  await next();
};

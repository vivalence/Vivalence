import { Url, Connection, shard, shape } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";
import { host } from "../../../gestalten/shard/index.js";

export const call = async (die, next) => {
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(shape.http(die.daemon.aperture)));
  await next();
};

export const prune = async (die, next) => {
  await belt.modes.prune(die.daemon);
  await next();
};

export const datamap = async (die, next) => {
  die.daemon.aperture.open("/datamap", () => shard.datamap.strip(die.daemon.datamap.getMetadata()));

  die.daemon.aperture
    .branch("/entities/literal")
    .graft(shard.datamap.repository(die.daemon.entities.literal))
    .graft(shard.datamap.reactive(die.daemon.entities.literal, die.daemon.twitch));

  die.daemon.aperture
    .branch("/entities/symbol")
    .graft(shard.datamap.repository(die.daemon.entities.symbol))
    .graft(shard.datamap.reactive(die.daemon.entities.symbol, die.daemon.twitch));

  await next();
};

export const entities = async (die, next) => {
  host.entities(die.daemon);
  await next();
};

export const metadata = async (die, next) => {
  host.metadata(die.daemon);
  await next();
};

export const cortex = async (die, next) => {
  host.cortex(die.daemon);
  await next();
};

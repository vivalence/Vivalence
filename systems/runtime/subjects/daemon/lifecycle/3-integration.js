import { Url, Connection, fromm, shard, shape } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";
import { host } from "../../../gestalten/shard/index.js";

export const call = async (die, next) => {
  die.connection = new Connection(new Url("http://internal"), shard.transmitter.inline(shape.http(die.daemon.aperture)));
  await next();
};

export const twitch = async (die, next) => {
  for (const mode of fromm.modes(die.daemon.modes).flat) {
    die.daemon.twitch.graft(mode.twitch);
  }
  await next();
};

export const prune = async (die, next) => {
  await belt.modes.prune(die.daemon, die.daemon.slug);
  await next();
};

export const datamap = async (die, next) => {
  die.daemon.aperture.open("/datamap", () => shard.datamap.strip(die.daemon.datamap.getMetadata()));
  for (const kind of ["literal", "symbol", "note", "mode"]) {
    die.daemon.aperture
      .branch(`/entities/${kind}`)
      .graft(shard.datamap.repository(die.daemon.entities[kind]))
      .graft(shard.datamap.reactive(die.daemon.entities[kind], die.daemon.twitch));
  }
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

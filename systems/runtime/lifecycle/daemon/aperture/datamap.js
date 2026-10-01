import { shard } from "@vivalence/typology";

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

  die.daemon.aperture
    .branch("/entities/mode")
    .graft(shard.datamap.repository(die.daemon.entities.mode))
    .graft(shard.datamap.reactive(die.daemon.entities.mode, die.daemon.twitch));

  await next();
};

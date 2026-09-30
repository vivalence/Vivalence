import { shard } from "@vivalence/typology";

export const datamap = async (die, next) => {
  die.daemon.aperture.open("/datamap", () => shard.datamap.strip(die.daemon.datamap.getMetadata()));

  die.daemon.aperture
    .branch("/entities/literal")
    .slurp(shard.datamap.repository(die.daemon.entities.literal))
    .slurp(shard.datamap.reactive(die.daemon.entities.literal, die.daemon.twitch));

  die.daemon.aperture
    .branch("/entities/symbol")
    .slurp(shard.datamap.repository(die.daemon.entities.symbol))
    .slurp(shard.datamap.reactive(die.daemon.entities.symbol, die.daemon.twitch));

  die.daemon.aperture
    .branch("/entities/mode")
    .slurp(shard.datamap.repository(die.daemon.entities.mode))
    .slurp(shard.datamap.reactive(die.daemon.entities.mode, die.daemon.twitch));

  await next();
};

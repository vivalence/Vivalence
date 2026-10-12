import * as shard from "../../../gestalten/shard/index.js";

export const entities = async (die, next) => {
  shard.host.entities(die.daemon);
  await next();
};

export const metadata = async (die, next) => {
  shard.host.metadata(die.daemon);
  await next();
};

export const cortex = async (die, next) => {
  shard.host.cortex(die.daemon);
  await next();
};

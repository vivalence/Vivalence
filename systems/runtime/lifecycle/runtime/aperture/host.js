import * as shard from "../../../gestalten/shard/index.js";

export const entities = async (die, next) => {
  shard.host.entities(die.runtime);
  await next();
};

export const metadata = async (die, next) => {
  shard.host.metadata(die.runtime);
  await next();
};

export const cortex = async (die, next) => {
  shard.host.cortex(die.runtime);
  await next();
};

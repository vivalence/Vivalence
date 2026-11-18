import paladin, { factories } from "@vivalence/paladin";

export const seat = async (shellDie, next) => {
  shellDie.instance = await factories.instance(paladin);

  await paladin.ledger.registry.supply();

  shellDie.mask = shellDie.instance.client("ghost");

  shellDie.register = await paladin.ledger.registry.wire(shellDie.mask);

  await next();
};

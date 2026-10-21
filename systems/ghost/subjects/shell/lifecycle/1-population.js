import paladin, { factories } from "@vivalence/paladin";

export const seat = async (shellDie, next) => {
  shellDie.instance = await factories.instance(paladin.instance);

  await paladin.ledger.registry.supply();

  shellDie.mask = shellDie.instance.mask("ghost");

  shellDie.register = await paladin.ledger.registry.wire(shellDie.mask);

  await next();
};

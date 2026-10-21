import paladin, { factories } from "@vivalence/paladin";

export const seat = async (shellDie, next) => {
  shellDie.instance = await factories.instance(paladin.instance);
  await paladin.ledger.registry.supply();
  shellDie.mask = shellDie.instance.clients.find((client) => client.manifest.slug === "ghost");
  if (!shellDie.mask)
    throw new Error(`instance ${shellDie.instance.home.absolute} masks no ghost client — ${shellDie.instance.clients.map((client) => client.manifest.slug).join(" · ") || "no client at all"}`);
  shellDie.register = await paladin.ledger.registry.wire(shellDie.mask);
  await next();
};

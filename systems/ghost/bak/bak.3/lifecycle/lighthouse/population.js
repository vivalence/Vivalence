import { Url } from "@vivalence/typology";

export const credentials = async (die, next) => {
  const { lighthouse } = die.client.runtime;
  const held = die.surface.credentials.read(new Url(die.client.runtime.remote).origin);
  if (held) lighthouse.restore(held);
  await lighthouse.verify();
  await next();
};

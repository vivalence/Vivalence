import { Url } from "@vivalence/typology";

export const credentials = async (die, next) => {
  const { lighthouse } = die.client.runtime;
  const origin = new Url(die.client.runtime.remote).origin;
  const off = lighthouse.$authority.listen((authority) => {
    if (!lighthouse.isAuthorized) return die.surface.credentials.clear(origin);
    die.surface.credentials.write(origin, { user: lighthouse.user, authority, at: new Date().toISOString() });
  });
  try {
    await next();
  } finally {
    off();
  }
};

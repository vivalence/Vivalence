import paladin from "@vivalence/paladin";
import { Vector, belt, control, traits } from "@vivalence/typology";
import * as catalog from "../traits/index.js";

export const credentials = async (lighthouseDie, next) => {
  const origin = lighthouseDie.client.runtime.remote.origin;
  const kept = paladin.vault.held(origin);
  if (kept !== null) lighthouseDie.client.runtime.lighthouse.restore(kept);
  await lighthouseDie.client.runtime.lighthouse.verify();
  const off = lighthouseDie.client.runtime.lighthouse.$authority.listen((authority) =>
    paladin.vault.store(origin, lighthouseDie.client.runtime.lighthouse.isAuthorized ? { user: lighthouseDie.client.runtime.lighthouse.user, authority, at: new Date().toISOString() } : null),
  );
  try {
    await next();
  } finally {
    off();
  }
};

export const staggered = async (lighthouseDie, next) => {
  for (const finalize of await traits.stagger(lighthouseDie.client.runtime.lighthouse, lighthouseDie, catalog)) await finalize();
  await next();
};

export const authorized = async (lighthouseDie, next) => {
  await Promise.race([belt.atom.until(lighthouseDie.client.runtime.lighthouse.$isAuthorized, Boolean, lighthouseDie.controller.abort.signal), control.hold(lighthouseDie.controller)]);
  if (!(await lighthouseDie.controller.proceed())) return;
  lighthouseDie.controller.stdout.log({ user: lighthouseDie.client.runtime.lighthouse.user.slug });
  await next();
};

export const execution = new Vector().use(credentials).use(staggered).use(authorized);

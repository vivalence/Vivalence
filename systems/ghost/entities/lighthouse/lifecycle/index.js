import { Vector, belt, control, traits } from "@vivalence/typology";
import * as catalog from "../traits/index.js";

const MODE = 0o600;

const held = (file) => {
  try {
    return JSON.parse(Deno.readTextFileSync(file));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return {};
    throw error;
  }
};

const store = (file, record) => {
  Deno.writeTextFileSync(file, `${JSON.stringify(record, null, 2)}\n`, { mode: MODE });
  Deno.chmodSync(file, MODE);
};

export const credentials = async (lighthouseDie, next) => {
  const file = lighthouseDie.client.instance.paladin.scope.ledger.branch("credentials.json").absolute;
  const origin = lighthouseDie.client.runtime.remote.origin;
  const all = held(file);
  if (Object.hasOwn(all, origin)) lighthouseDie.client.runtime.lighthouse.restore(all[origin]);
  await lighthouseDie.client.runtime.lighthouse.verify();
  const off = lighthouseDie.client.runtime.lighthouse.$authority.listen((authority) => {
    const { [origin]: stale, ...kept } = held(file);
    if (!lighthouseDie.client.runtime.lighthouse.isAuthorized) return store(file, kept);
    store(file, { ...kept, [origin]: { user: lighthouseDie.client.runtime.lighthouse.user, authority, at: new Date().toISOString() } });
  });
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
  lighthouseDie.controller.stdout.message({ user: lighthouseDie.client.runtime.lighthouse.user.slug });
  await next();
};

export const execution = new Vector().use(credentials).use(staggered).use(authorized);

import { parseHTML } from "linkedom";

const { window, document } = parseHTML("<!doctype html><html><body></body></html>");
const store = new Map();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
});
Object.assign(globalThis, { window, document });
delete globalThis.Deno;

const { default: paladin, factories } = await import("@vivalence/paladin");
const origin = "http://lighthouse.probe";
const before = paladin.vault.held(origin);
paladin.vault.store(origin, { user: { id: "u1" }, authority: "token" });
const after = paladin.vault.held(origin);
const stored = [...store.keys()];
paladin.vault.store(origin, null);
const removed = paladin.vault.held(origin);
const first = factories.instance(paladin.instance);
const second = factories.instance(paladin.instance);
const wired = await paladin.ledger.registry.wire();

console.log(JSON.stringify({
  deno: "Deno" in globalThis,
  document: typeof globalThis.document.createElement,
  before,
  after,
  stored,
  removed,
  memoized: first === second,
  instance: (await first) === paladin.instance,
  slug: paladin.instance.manifest.slug,
  clients: paladin.instance.clients.map((client) => client.manifest.slug),
  env: paladin.env.get("PUBLIC_VIVA_PROBE"),
  modes: wired.modes.map((citizen) => [citizen.manifest.slug, citizen.module.manifest.owner]),
  remote: paladin.instance.runtime.statics.remote.origin,
  reference: paladin.instance.clients[0].reference.absolute,
  hallucinators: wired.hallucinators,
}));

// limit: 1500 chars
import paladin, { factories } from "@vivalence/paladin";

await factories.instance(paladin.instance);
const registry = paladin.ledger.registry;
const checkout = paladin.scope.repository;
const commons = checkout.branch("commons");
const seen = [];
let started = performance.now();
const reconciled = await registry.reconcile(checkout, commons);
seen.push({ step: "reconcile", ms: Math.round(performance.now() - started) });
const mount = registry.mount.bind(registry);
for (const [owner, { slug, mount: seat }] of Object.entries(reconciled.record)) {
  started = performance.now();
  await mount(registry.resolve(seat), { owner, slug });
  seen.push({ step: `mount ${owner}`, ms: Math.round(performance.now() - started), modules: registry.pensieve.byType().filter?.((held) => held.source.absolute.startsWith(registry.resolve(seat).absolute ?? registry.resolve(seat))).length });
}
console.table(seen);
Deno.exit(0);

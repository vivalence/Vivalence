import { Path, Span } from "@vivalence/typology";
import { Paladin, Pensieve, Registry, FULL, lifecycle } from "@vivalence/paladin/typology";

const RECORD = [
  "read", "write", "tapped", "has", "add", "remove", "locate", "resolve", "stored", "row",
  "discover", "seed", "reconcile", "tap", "untap",
];
const MODULES = ["mount", "list", "lookup", "assert", "module", "accio", "wire"];

const crossed = [];
const half = (label, methods, getters, state) => {
  const held = { ...state };
  for (const name of methods) held[name] = Registry.prototype[name];
  for (const name of getters)
    Object.defineProperty(held, name, Object.getOwnPropertyDescriptor(Registry.prototype, name));
  return new Proxy(held, {
    get(target, key, receiver) {
      if (typeof key === "symbol" || key === "then" || key in target)
        return Reflect.get(target, key, receiver);
      crossed.push(`${label} reads ${key}`);
      throw new Error(`${label} reads ${key}`);
    },
  });
};

const author = async (directory, modules) => {
  await Deno.mkdir(directory, { recursive: true });
  for (const [filename, manifest] of Object.entries(modules))
    await Deno.writeTextFile(
      `${directory}/${filename}`,
      `export const manifest = ${JSON.stringify(manifest)};`,
    );
};

const ledger = await Deno.makeTempDir({ prefix: "registry-split-probe-" });
const checkout = await Deno.makeTempDir({ prefix: "registry-split-probe-checkout-" });
const external = await Deno.makeTempDir({ prefix: "registry-split-probe-external-" });
await Deno.mkdir(`${ledger}/registry`);
await Deno.mkdir(`${checkout}/commons`);
await author(external, {
  "package.viva.js": { owner: "@external", type: "package", slug: "external", version: "0.0.1" },
  "write.viva.js": { type: "game", slug: "write", version: "0.0.1" },
});

const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([
  ["ledger", () => true, () => new Path(ledger)],
  ["registry", () => true, () => new Path(`${ledger}/registry`)],
  ["repository", () => true, () => new Path(checkout)],
]);

const path = new Path(`${ledger}/registry.json`);
const taps = half("taps", RECORD, ["base"], {
  paladin,
  path,
  held: null,
  from: null,
  fallback: true,
});
const span = new Span({ nature: "/registry" });
const integrity = new Map();
const pensieve = new Pensieve();
const modules = half("modules", MODULES, [], { paladin, pensieve, span, integrity });

const supply = async () => {
  const commons = paladin.scope.repository.branch("commons");
  const reconciled = await taps.reconcile(paladin.scope.repository, commons);
  const record = reconciled?.record ?? (await taps.seed(commons));
  for (const [owner, { slug, mount }] of Object.entries(record))
    await modules.mount(taps.resolve(mount), { owner, slug });
  return reconciled?.stale ?? [];
};

console.log("tap", await taps.tap(external));
console.log("tapped", await taps.tapped());
console.log("stale", await supply());
const games = (registry) =>
  registry.list({ type: "game" }).map((module) => module.manifest.identifier);
console.log("list game", games(modules));
const citizen = await modules.accio("@external/game/write");
const sourced = citizen.source.absolute === `${external}/write.viva.js`;
console.log("accio", citizen.manifest.identifier, sourced);
const mask = { manifest: { type: "runtime" }, modes: [{ module: "@external/game/write" }] };
const wired = await modules.wire(mask);
console.log("wire modes", wired.modes.map((mode) => mode.manifest.slug));

const whole = new Registry(paladin, path);
await whole.supply();
const same = JSON.stringify(games(whole)) === JSON.stringify(games(modules));
console.log("same as the one class", same);
console.log("untap", await taps.untap("@external"));
console.log("crossed", crossed);
for (const directory of [ledger, checkout, external])
  await Deno.remove(directory, { recursive: true });

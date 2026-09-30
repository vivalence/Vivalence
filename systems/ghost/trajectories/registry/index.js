import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { object, v, Vector } from "@vivalence/typology";
import { path } from "../../belt/index.js";
import { bootstrap } from "./bootstrap.js";
import { Doctor } from "./Doctor.jsx";

export const registry = new Vector();

async function packages() {
  await paladin.ledger.registry.supply();
  const locations = await paladin.ledger.registry.locations();
  return Promise.all(
    locations.map(async (location) => {
      const root = paladin.ledger.registry.resolve(location);
      const declarations = await paladin.find.type(root, "package").catch(() => []);
      const modules = await paladin.find.viva(root).catch(() => []);
      return {
        location,
        mount: root.absolute,
        owner: declarations.map((module) => module.manifest.owner).join(" ") || null,
        modes: modules.length || null,
        identifier: declarations
          .map((module) => `${module.manifest.owner}/${module.manifest.type}/${module.manifest.slug}`)
          .join(" ") || null,
      };
    }),
  );
}

async function tapped(location) {
  const rows = await packages();
  return (
    rows.find((row) => row.location === location || row.location === location.replace(/^\.\//, "")) ??
      rows.find((row) => row.mount === resolve(location)) ??
      rows.find((row) => (row.identifier ?? "").split(" ").includes(location)) ??
      null
  );
}

export async function store(paladin, tapped) {
  const scope = paladin.scope.registry;
  if (!scope) return { path: null, resident: [], untapped: [] };
  const found = await paladin.ledger.registry.discover(scope).catch(() => []);
  const resident = found.filter((root) => !found.some((other) => other !== root && root.startsWith(`${other}/`)));
  const covered = (root) => tapped.some((held) => root === held || root.startsWith(`${held}/`));
  return { path: scope.absolute, resident, untapped: resident.filter((root) => !covered(root)) };
}

const declarationFirst = ([a], [b]) => (a === "package" ? -1 : b === "package" ? 1 : a.localeCompare(b));

registry.open(
  {
    nature: "/doctor",
    valence: "registry report card — the record against the store and what the taps supply: stale locations, untapped residents, the mode census by owner",
    schema: v.object({}),
  },
  async (ctx) => {
    const registry = paladin.ledger.registry;
    await registry.supply();
    const locations = await registry.locations();
    const entries = await Promise.all(
      locations.map(async (location) => {
        const root = registry.resolve(location);
        const declarations = await paladin.find.type(root, "package").catch(() => []);
        return { location, root: root.absolute, owners: declarations.map((module) => module.manifest.owner) };
      }),
    );
    const packages = [];
    for (const [owner, ownerMap] of paladin.ledger.registry.pensieve) {
      const types = {};
      for (const [type, typeMap] of [...ownerMap].sort(declarationFirst)) types[type] = [...typeMap.keys()].sort();
      const tapped = entries.find((entry) => entry.owners.includes(owner));
      packages.push({
        owner,
        location: tapped?.location ?? null,
        root: tapped?.root ?? null,
        modes: Object.values(types).reduce((sum, slugs) => sum + slugs.length, 0),
        types,
      });
    }

    const report = {
      record: { path: registry.path.absolute, tapped: locations.length, stale: registry.stale, entries },
      store: await store(paladin, entries.map((entry) => entry.root)),
      // what the fold said at mount: one row per faulted path
      integrity: [...registry.integrity].map(([path, faults]) => ({ path: path.replace(/^\/registry/, ""), faults: [...faults] })),
      pensieve: {
        modes: packages.reduce((sum, held) => sum + held.modes, 0),
        types: new Set(packages.flatMap((held) => Object.keys(held.types))).size,
        owners: packages.length,
      },
      packages,
    };

    ctx.effect = report;
    await ctx.view?.scroll.emit({ report }, null, Doctor);
  },
);

registry.open(
  {
    nature: "/list",
    valence: "every tapped package — mount, the owner it declares, how many modes it carries, and its identifier",
    schema: v.object({}),
  },
  async (ctx) => {
    ctx.effect = { packages: (await packages()).map((row) => object.filter(row, (key) => key !== "location")) };
  },
);

registry.open(
  {
    nature: "/tap",
    valence: "tap a package — record a location; a remote source clones into the store (or target)",
    schema: v.object({
      source: v.string().desc("path or git url").optional(),
      target: v.string().desc("clone destination for a remote source").optional(),
    }),
  },
  async (ctx) => {
    let [source, target] = ctx.signal.params ?? [];
    if (!source) throw new Error("usage: viva registry tap <path | git url> [target]");
    source = path.source(source);
    if (target) target = resolve(path.cwd(), target);
    const location = await paladin.ledger.registry.tap(source, target);
    ctx.effect = {
      location,
      root: paladin.ledger.registry.resolve(location).absolute,
      record: await paladin.ledger.registry.locations(),
    };
  },
);

registry.open(
  {
    nature: "/untap",
    valence: "untap a package — record removal only, the store keeps the working copy",
    schema: v.object({ location: v.string().desc("recorded location").optional() }),
  },
  async (ctx) => {
    const location = ctx.signal.params?.[0];
    if (!location) throw new Error("usage: viva registry untap <location>");
    const held = await tapped(location);
    if (!held) throw new Error(`registry/untap: no tapped package '${location}' — viva registry/list`);
    ctx.effect = { untapped: held.location, record: await paladin.ledger.registry.untap(held.location) };
  },
);

registry.open(
  {
    nature: "/bootstrap",
    valence:
      "bootstrap a package — a bare manifest, or a clone of another package renamed to the destination; the result is tapped",
    schema: v.object({
      destination: v.string().desc("where the package lands").optional(),
      source: v.string().desc("slug | @owner/package/slug — preset for the picker").optional(),
    }),
  },
  bootstrap,
);

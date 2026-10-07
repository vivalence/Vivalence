import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import { path } from "../../belt/index.js";
import { bootstrap } from "./bootstrap.js";
import { Doctor } from "./Doctor.jsx";

export const registry = new Vector();

async function packages() {
  await paladin.ledger.registry.supply();
  const record = await paladin.ledger.registry.tapped();
  return Promise.all(
    Object.entries(record).map(async ([owner, { slug, mount, remote }]) => {
      const root = paladin.ledger.registry.resolve(mount);
      const modules = await paladin.find.viva(root).catch(() => []);
      return { owner, slug, identifier: `${owner}/package/${slug}`, mount: root.absolute, remote: remote ?? null, modes: modules.length || null };
    }),
  );
}

async function tapped(name) {
  const rows = await packages();
  return rows.find((row) => [row.owner, row.slug, row.identifier, row.mount].includes(name) || row.mount === resolve(name)) ?? null;
}

export async function store(paladin, tapped) {
  const scope = paladin.scope.registry;
  if (!scope) return { path: null, resident: [], untapped: [] };
  const found = (await paladin.ledger.registry.discover(scope).catch(() => [])).map((held) => held.root);
  const resident = found.filter((root) => !found.some((other) => other !== root && root.startsWith(`${other}/`)));
  const covered = (root) => tapped.some((held) => root === held || root.startsWith(`${held}/`));
  return { path: scope.absolute, resident, untapped: resident.filter((root) => !covered(root)) };
}

const declarationFirst = ([a], [b]) => (a === "package" ? -1 : b === "package" ? 1 : a.localeCompare(b));

registry.open(
  {
    nature: "/doctor",
    valence: "registry report card — the record against the store and what the taps supply: stale owners, untapped residents, the mode census by owner",
    schema: v.object({}),
  },
  async (ctx) => {
    const registry = paladin.ledger.registry;
    await registry.supply();
    const entries = Object.entries(await registry.tapped()).map(([owner, { slug, mount, remote }]) => (
      { owner, slug, mount, root: registry.resolve(mount).absolute, remote: remote ?? null }
    ));
    const packages = [];
    for (const [owner, ownerMap] of paladin.ledger.registry.pensieve) {
      const types = {};
      for (const [type, typeMap] of [...ownerMap].sort(declarationFirst)) types[type] = [...typeMap.keys()].sort();
      const tapped = entries.find((entry) => entry.owner === owner);
      packages.push({
        owner,
        mount: tapped?.mount ?? null,
        root: tapped?.root ?? null,
        modes: Object.values(types).reduce((sum, slugs) => sum + slugs.length, 0),
        types,
      });
    }

    const report = {
      record: { path: registry.path?.absolute ?? null, tapped: entries.length, stale: registry.stale, entries },
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
    valence: "every tapped package — owner, identifier, mount, remote, and how many modes it carries",
    schema: v.object({}),
  },
  async (ctx) => {
    ctx.effect = { packages: await packages() };
  },
);

registry.open(
  {
    nature: "/tap",
    valence: "tap a package — record owner → slug, mount; a remote source clones into the store (or target) and is recorded",
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
    const owner = await paladin.ledger.registry.tap(source, target);
    const record = await paladin.ledger.registry.tapped();
    ctx.effect = { owner, root: paladin.ledger.registry.resolve(record[owner].mount).absolute, record };
  },
);

registry.open(
  {
    nature: "/untap",
    valence: "untap a package — record removal only, the store keeps the working copy",
    schema: v.object({ package: v.string().desc("owner, slug, identifier or mount. Example: @chess").optional() }),
  },
  async (ctx) => {
    const name = ctx.signal.params?.[0];
    if (!name) throw new Error("usage: viva registry untap <owner | slug | mount>");
    const held = await tapped(name);
    if (!held) throw new Error(`registry/untap: no tapped package '${name}' — viva registry/list`);
    ctx.effect = { untapped: held.owner, record: await paladin.ledger.registry.untap(held.owner) };
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

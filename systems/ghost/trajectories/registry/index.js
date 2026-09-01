import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import { path } from "../../belt/index.js";
import { bootstrap } from "./bootstrap.js";
import { Doctor } from "./Doctor.jsx";

export const registry = new Vector();

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
    valence: "registry report card — the record against the store and what the taps supply: stale references, untapped residents, the mode census by owner",
    schema: v.object({}),
  },
  async (ctx) => {
    await paladin.vip.supply();
    const registry = paladin.ledger.registry;
    const references = await registry.list();
    const entries = await Promise.all(
      references.map(async (reference) => {
        const root = registry.resolve(reference);
        const declarations = await paladin.find.type(root, "package").catch(() => []);
        return { reference, root: root.absolute, owners: declarations.map((module) => module.manifest.owner) };
      }),
    );
    const packages = [];
    for (const [owner, ownerMap] of paladin.vip.pensieve) {
      const types = {};
      for (const [type, typeMap] of [...ownerMap].sort(declarationFirst)) types[type] = [...typeMap.keys()].sort();
      const tapped = entries.find((entry) => entry.owners.includes(owner));
      packages.push({
        owner,
        reference: tapped?.reference ?? null,
        root: tapped?.root ?? null,
        modes: Object.values(types).reduce((sum, slugs) => sum + slugs.length, 0),
        types,
      });
    }

    const report = {
      record: { path: registry.path.absolute, tapped: references.length, stale: paladin.vip.stale, entries },
      store: await store(paladin, entries.map((entry) => entry.root)),
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
    await paladin.vip.supply();
    const references = await paladin.ledger.registry.list();
    const rows = await Promise.all(
      references.map(async (reference) => {
        const root = paladin.ledger.registry.resolve(reference);
        const declarations = await paladin.find.type(root, "package").catch(() => []);
        const modules = await paladin.find.viva(root).catch(() => []);
        return {
          mount: root.absolute,
          owner: declarations.map((module) => module.manifest.owner).join(" ") || null,
          modes: modules.length || null,
          identifier: declarations
            .map((module) => `${module.manifest.owner}/${module.manifest.type}/${module.manifest.slug}`)
            .join(" ") || null,
        };
      }),
    );
    ctx.effect = { packages: rows };
  },
);

registry.open(
  {
    nature: "/tap",
    valence: "tap a package — record a reference; a remote source clones into the store (or target)",
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
    const reference = await paladin.vip.tap(source, target);
    ctx.effect = {
      reference,
      root: paladin.ledger.registry.resolve(reference).absolute,
      record: await paladin.ledger.registry.list(),
    };
  },
);

registry.open(
  {
    nature: "/untap",
    valence: "untap a package — record removal only, the store keeps the working copy",
    schema: v.object({ reference: v.string().desc("recorded reference").optional() }),
  },
  async (ctx) => {
    const reference = ctx.signal.params?.[0];
    if (!reference) throw new Error("usage: viva registry untap <reference>");
    ctx.effect = { record: await paladin.vip.untap(reference) };
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

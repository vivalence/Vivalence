import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { store } from "../../../gestalten/belt/registry.js";
import { card } from "./card.js";

const declarationFirst = ([a], [b]) => (a === "package" ? -1 : b === "package" ? 1 : a.localeCompare(b));

export const doctor = new Vector().open(
  {
    nature: "/registry/doctor",
    valence: "registry report card — the record against the store and what the taps supply: stale owners, untapped residents, the mode census by owner. Example: viva registry/doctor",
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

    await ctx.view.emit("report", { blocks: card(report) });
    return report;
  },
);

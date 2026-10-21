import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { registry } from "../belt/index.js";

const declarationFirst = ([a], [b]) => (a === "package" ? -1 : b === "package" ? 1 : a.localeCompare(b));

export const doctor = new Vector().open(
  {
    nature: "/registry/doctor",
    valence: "registry report card — the record against the store and what the taps supply: stale owners, untapped residents, the module census by owner. Example: viva registry/doctor",
    input: v.object({}),
  },
  async () => {
    const held = paladin.ledger.registry;
    await held.supply();
    const entries = Object.entries(await held.tapped()).map(([owner, { slug, mount, remote }]) => (
      { owner, slug, mount, root: held.resolve(mount).absolute, remote: remote ?? null }
    ));
    const packages = [];
    for (const [owner, ownerMap] of held.pensieve) {
      const types = {};
      for (const [type, typeMap] of [...ownerMap].sort(declarationFirst)) types[type] = [...typeMap.keys()].sort();
      const tapped = entries.find((entry) => entry.owner === owner);
      packages.push({
        owner,
        mount: tapped?.mount ?? null,
        root: tapped?.root ?? null,
        modules: Object.values(types).reduce((sum, slugs) => sum + slugs.length, 0),
        types,
      });
    }

    return {
      record: { path: held.path?.absolute ?? null, tapped: entries.length, stale: held.stale, entries },
      store: await registry.store(entries.map((entry) => entry.root)),
      integrity: [...held.integrity].map(([path, faults]) => ({ path: path.replace(/^\/registry/, ""), faults: [...faults] })),
      pensieve: {
        modules: packages.reduce((sum, each) => sum + each.modules, 0),
        types: new Set(packages.flatMap((each) => Object.keys(each.types))).size,
        owners: packages.length,
      },
      packages,
    };
  },
);

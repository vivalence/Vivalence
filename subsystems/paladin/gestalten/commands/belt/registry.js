import { resolve } from "@std/path";
import paladin from "../../../mod.js";

export async function packages() {
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

export async function tapped(name) {
  const rows = await packages();
  return rows.find((row) => [row.owner, row.slug, row.identifier, row.mount].includes(name) || row.mount === resolve(name)) ?? null;
}

export async function store(tapped) {
  const scope = paladin.scope.registry;
  if (!scope) return { path: null, resident: [], untapped: [] };
  const found = (await paladin.ledger.registry.discover(scope).catch(() => [])).map((held) => held.root);
  const resident = found.filter((root) => !found.some((other) => other !== root && root.startsWith(`${other}/`)));
  const covered = (root) => tapped.some((held) => root === held || root.startsWith(`${held}/`));
  return { path: scope.absolute, resident, untapped: resident.filter((root) => !covered(root)) };
}

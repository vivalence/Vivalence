import paladin from "../../../mod.js";

const by = (...keys) => (a, b) => keys.reduce((held, key) => held || String(a[key]).localeCompare(String(b[key])), 0);

export async function modes({ type } = {}) {
  await paladin.ledger.registry.supply();
  const rows = [];
  for (const [owner, ownerMap] of paladin.ledger.registry.pensieve) {
    for (const [kind, typeMap] of ownerMap) {
      if (type && kind !== type) continue;
      for (const [slug, slugMap] of typeMap) {
        for (const [version] of slugMap) rows.push({ owner, type: kind, slug, version });
      }
    }
  }
  return {
    label: type ?? "mode",
    rows: rows.sort(by("owner", "type", "slug")),
    keys: ["owner", "type", "slug"],
    columns: type ? ["owner", "slug"] : ["owner", "type", "slug"],
    identifier: (row) => `${row.owner}/${row.type}/${row.slug}`,
  };
}

export async function instances() {
  const rows = (await paladin.ledger.instances.list())
    .map(({ slug, mount, updatedAt }) => ({ slug, mount, updated: updatedAt?.slice(0, 10) ?? "" }))
    .sort(by("slug"));
  const held = paladin.env.get("VIVA_INSTANCE_MOUNT");
  return {
    label: "instance",
    rows,
    index: Math.max(0, rows.findIndex((row) => row.slug === held || row.mount === held)),
    keys: ["slug", "mount"],
    columns: ["slug", "updated", "mount"],
    identifier: (row) => row.slug,
  };
}

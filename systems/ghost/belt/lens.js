import paladin from "@vivalence/paladin";

// lenses :: one per dataset, each folding a live record into the row shape `pick`/`Search` eat.
// a lens names the PROJECTION, never the store — `modes` reads the pensieve, `instances` reads the
// ledger, a daemon lens would read the attached set. nothing here is instance-specific.

export async function modes({ type } = {}) {
  await paladin.vip.supply();
  const rows = [];
  for (const [owner, ownerMap] of paladin.vip.pensieve) {
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
    facets: ["owner", "type"],
    columns: type ? ["owner", "slug"] : ["owner", "type", "slug"],
    reference: (row) => `${row.owner}/${row.type}/${row.slug}`,
  };
}

export async function instances() {
  const rows = (await paladin.ledger.instances.list()).map(({ slug, mount, updatedAt }) => ({
    slug,
    mount,
    updated: updatedAt?.slice(0, 10) ?? "",
  })).sort(by("slug"));
  // the lens knows which row is live, so the picker opens ON the current selection.
  const held = paladin.env.get("VIVA_INSTANCE_MOUNT");
  return {
    label: "instance",
    rows,
    index: Math.max(0, rows.findIndex((row) => row.slug === held || row.mount === held)),
    keys: ["slug", "mount"],
    facets: ["slug"],
    columns: ["slug", "updated", { key: "mount", color: undefined }],
    reference: (row) => row.slug,
  };
}

const by = (...keys) => (a, b) => keys.reduce((held, key) => held || String(a[key]).localeCompare(String(b[key])), 0);

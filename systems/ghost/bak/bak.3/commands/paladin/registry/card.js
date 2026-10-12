const line = (name, note, path, warn) => ({
  spans: [
    { text: name, tone: "link", width: 10 },
    { text: note, tone: warn ? "caution" : "ink", width: 32 },
    { text: path, tone: "muted" },
  ],
  depth: 0,
});

const marked = (mark, tone, text, gloss) => ({
  spans: [{ text: `${mark} ${text}`, tone }, { text: gloss, tone: "muted" }],
  depth: 1,
});

export function card(report) {
  const { record, store, pensieve, packages, integrity } = report;
  const inside = (root) => (store.path !== null && root.startsWith(`${store.path}/`) ? root.slice(store.path.length + 1) : root);
  return [
    { heading: "viva registry/doctor" },
    line("record", `${record.tapped} tapped · ${record.stale.length} stale`, record.path === null ? "—" : record.path, record.stale.length > 0),
    ...record.stale.map((location) => marked("✗", "negative", location, " gone — viva registry/untap")),
    line("store", `${store.resident.length} resident · ${store.untapped.length} untapped`, store.path === null ? "—" : store.path, store.untapped.length > 0),
    ...store.untapped.map((root) => marked("○", "caution", inside(root), " untapped — viva registry/tap")),
    line("pensieve", `${pensieve.modes} modes · ${pensieve.types} types · ${pensieve.owners} owners`, "", false),
    line("integrity", `${integrity.length} faulted`, "", integrity.length > 0),
    ...integrity.flatMap((row) => [
      { spans: [{ text: `✗ ${inside(row.path)}`, tone: "negative" }], depth: 1 },
      ...row.faults.map((sentence) => ({ spans: [{ text: sentence, tone: "negative" }], depth: 3 })),
    ]),
    ...packages.flatMap((held) => [
      { heading: held.owner, note: `${held.modes} modes  ${held.root === null ? "no tap declares this owner" : held.root}` },
      ...Object.entries(held.types).map(([type, slugs]) => ({
        spans: [{ text: type, tone: "ink", width: 14 }, { text: slugs.join("  "), tone: "muted" }],
        depth: 1,
      })),
    ]),
  ];
}

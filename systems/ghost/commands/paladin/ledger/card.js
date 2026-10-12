const held = (row, key) => (Object.hasOwn(row, key) ? row[key] : null);

const flags = (row) => (Object.hasOwn(row, "flags") ? row.flags : []);

const home = (name, scope, tail) => ({
  spans: [
    { text: scope.present ? "✓" : "✗", tone: scope.present ? "positive" : "negative" },
    { text: name, tone: "strong", width: 12 },
    { text: scope.path === null ? "—" : scope.path, tone: "muted" },
    ...(!scope.present && tail !== null ? [{ text: ` → ${tail}`, tone: "muted" }] : []),
  ],
  depth: scope.depth,
});

const organ = (name, count, note, warn, tail) => ({
  spans: [
    { text: name, tone: "link", width: 16 },
    { text: String(count), tone: "ink", width: 14 },
    { text: note, tone: warn ? "caution" : "muted" },
    ...(tail === null ? [] : [{ text: ` → ${tail}`, tone: "muted" }]),
  ],
  depth: 1,
});

const marked = (mark, tone, text, gloss) => ({ spans: [{ text: `${mark} ${text}`, tone }, { text: gloss, tone: "muted" }], depth: 2 });

const rows = (table) => ({ table, depth: 2 });

const recipeOrgan = (recipe) => {
  const name = recipe.path.split("/").at(-1);
  const count = recipe.spoken ? "present" : recipe.present ? "mute" : "absent";
  const errored = Object.hasOwn(recipe, "error");
  const note = errored
    ? recipe.error
    : recipe.spoken
      ? `${recipe.manifest.slug} · ${recipe.slots.join(" ")}`
      : "instances inherit nothing — viva ledger/install";
  return organ(name, count, note, errored, null);
};

const variable = (row) => [
  {
    spans: [
      { text: row.key, tone: "link", width: 30 },
      { text: row.stratum, tone: "primary", width: 9 },
      { text: String(row.value), tone: "muted" },
    ],
    depth: 1,
  },
  ...(Object.hasOwn(row, "shadowed") ? row.shadowed : []).map((voice) => ({
    spans: [{ text: "".padEnd(30), tone: "muted" }, { text: `⋯ ${voice.stratum.padEnd(9)} ${voice.value}`, tone: "muted" }],
    depth: 1,
  })),
];

export function card(report) {
  const { homes, scopes, env, recipe, records, record, store, instances, locks, sessions, logs, environment, strata } = report;
  const stale = record.entries.filter((entry) => !entry.present);
  const pinned = record.entries.filter((entry) => entry.pinned).length;
  const flagged = (flag) => instances.filter((row) => flags(row).some((each) => each.startsWith(flag))).length;
  const shelved = instances.filter(
    (row) => row.mount !== null && row.mount.startsWith(`${homes.instances}/`) && !flags(row).includes("dangling"),
  ).length;
  const moved = store.path !== null && store.path !== `${homes.ledger}/registry`;
  const scope = (name) => scopes.find((each) => each.name === name);
  const anomalies = flagged("orphan") + flagged("dangling") + flagged("shadowed");

  return [
    { heading: "viva ledger/doctor" },
    home("ledger", scope("ledger"), "viva ledger/install"),
    organ(
      ".env",
      env.present ? "present" : "absent",
      `${env.vars.length} vars · ${env.secrets.length} secrets${env.blank.length ? ` · ${env.blank.length} blank` : ""}`,
      env.blank.length > 0,
      null,
    ),
    recipeOrgan(recipe),
    ...Object.entries(recipe.declared).map(([slot, line]) => ({
      spans: [{ text: slot, tone: "muted", width: 14 }, { text: line, tone: "muted" }],
      depth: 2,
    })),
    organ(
      records.registry,
      `${record.entries.length} tapped`,
      `${pinned} pinned · ${record.entries.length - pinned} store · ${stale.length} stale`,
      stale.length > 0,
      "registry/doctor",
    ),
    ...stale.map((entry) => marked("✗", "negative", `${entry.owner} ${entry.mount}`, "  gone — viva registry/untap")),
    organ(
      "registry/",
      `${store.resident.length} resident`,
      `${store.untapped.length} untapped${moved ? ` · moved → ${store.path}` : ""}`,
      store.untapped.length > 0,
      null,
    ),
    ...store.untapped.map((root) => marked("○", "caution", root.split("/").at(-1), "  untapped — viva registry/tap")),
    organ(records.instances, `${instances.length} recorded`, "", false, null),
    rows(instances.map((row) => ({
      slug: row.slug,
      valence: held(row, "valence"),
      mount: row.mount === `${homes.instances}/${row.slug}` ? null : row.mount,
      updated: held(row, "updatedAt") === null ? null : row.updatedAt.slice(0, 10),
      flags: flags(row).length ? flags(row).join(" ") : null,
    }))),
    organ(
      "instances/",
      `${shelved} shelved`,
      `${flagged("orphan")} orphan · ${flagged("dangling")} dangling · ${flagged("shadowed")} shadowed`,
      anomalies > 0,
      null,
    ),
    organ("locks/", `${locks.length} running`, "", false, null),
    rows(locks),
    organ("sessions/", `${sessions.length} shells`, "", false, null),
    rows(sessions),
    organ("logs/", `${logs.length} files`, "", false, null),
    rows(logs),
    { heading: "scopes" },
    home("repository", scope("repository"), null),
    home("instance", scope("instance"), null),
    home("mountpoint", scope("mountpoint"), null),
    { heading: "environment", note: `(${environment.length} vars · ${strata.join(" › ")})` },
    ...environment.flatMap(variable),
  ];
}

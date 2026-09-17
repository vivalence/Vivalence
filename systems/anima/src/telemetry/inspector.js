import { computed } from "nanostores";

const row = (nature, valence, invoke) => ({ nature, signature: { nature, valence }, invoke });
const table = (nature, children, valence) => ({
  nature,
  children,
  signature: { nature, valence, directed: { variant: "table" } },
});

const ROW_CAP = 30;

export const project = (lighthouse, terminals, bridge) =>
  computed(
    [
      lighthouse.$status,
      lighthouse.$isAuthorized,
      lighthouse.$isIdentified,
      lighthouse.$identity,
      lighthouse.$daemons,
      terminals.$active,
      terminals.$entities,
    ],
    () => compose(lighthouse, terminals, bridge),
  );

export function compose(lighthouse, terminals, bridge) {
  const terminal = terminals.active;
  const thread = terminal?.thread;
  const daemons = lighthouse.$daemons.get() ?? [];
  const shells = terminals.$entities?.get?.() ?? [];

  return [
    table("lighthouse", [
      row("authorized", { name: String(lighthouse.isAuthorized) }),
      row("identified", { name: String(lighthouse.isIdentified) }),
      row("status", { name: lighthouse.status?.code ?? "—" }),
      row("identity", { name: lighthouse.identity?.slug ?? "—" }),
      row("connection", { name: lighthouse.connection.$state.get() }),
      row("logout", "end session", () => lighthouse.logout()),
      table("daemons", daemons.map(composeDaemon), { name: String(daemons.length) }),
    ]),

    table("active", [
      row("terminal", { name: terminal?.id ?? "—" }),
      row("thread", { name: thread?.id ?? "—" }),
      row("daemon", { name: terminal?.daemon?.slug ?? String(terminal?.daemon ?? "—") }),
      row("mode", { name: terminal?.mode?.slug ?? String(terminal?.mode ?? "—") }),
      row("spawn", "new terminal", () => terminals.create()),
      ...(thread ? [row("clear", "clear thread", () => (terminals.active.thread = null))] : []),
    ]),

    table(
      "terminals",
      shells.map((shell) => row(shell.slug ?? shell.id, { name: shell.id }, () => terminals.activate(shell.id))),
      { name: String(shells.length) },
    ),

    table("bridge", [
      row("pincer", { name: `${Math.round(bridge.layout.pincer.x)}·${Math.round(bridge.layout.pincer.y)}` }),
      row("orientation", { name: `${bridge.layout.orientation}°` }),
      row("viewport", { name: `${bridge.layout.viewport.width}×${bridge.layout.viewport.height}` }),
      row("standard", { name: `${Math.round(bridge.layout.standard.x)}·${Math.round(bridge.layout.standard.y)}` }),
      row("previous", { name: `${Math.round(bridge.layout.previous.x)}·${Math.round(bridge.layout.previous.y)}` }),
    ]),

    ...(thread ? [composeThread(thread)] : []),
  ];
}

function composeDaemon(daemon) {
  return table(daemon.slug, [
    row("connection", { name: daemon.connection?.$state?.get?.() ?? "—" }),
    row("status", { name: daemon.status?.reflection?.code?.toLowerCase() ?? "—" }),
    row("slug", { name: daemon.slug ?? "—" }),
    ...(daemon.manifest
      ? [row("traits", { name: (daemon.manifest.traits ?? []).join(", ") || "—" })]
      : []),
    ...(daemon.entities
      ? [
          table(
            "entities",
            ["mode", "intent", "thread", "buffer", "turn", "literal"]
              .filter((name) => daemon.entities[name])
              .map((name) => composeRepo(name, daemon.entities[name])),
          ),
        ]
      : []),
  ]);
}

function composeRepo(name, repo) {
  const entities = repo.$entities?.get?.();
  const rows = Array.isArray(entities) ? entities : [...(entities?.values?.() ?? [])];
  if (rows.length === 0 || rows.length > ROW_CAP) return row(name, { name: String(rows.length) });
  return table(
    name,
    rows.map((entity) =>
      row(entity.slug ?? entity.id, { name: entity.name ?? entity.type ?? entity.app ?? entity.id }),
    ),
    { name: String(rows.length) },
  );
}

function composeThread(thread) {
  return table("thread", [
    row("id", { name: thread.id ?? "—" }),
    ...(thread.intent ? [row("intent", { name: thread.intent?.slug ?? String(thread.intent) })] : []),
    row("counter", { name: String(thread.counter ?? 0) }),
    row("cursor", { name: String(thread.cursor ?? 0) }),
    ...(thread.buffers?.length
      ? [
          table(
            "buffers",
            thread.buffers.map((buffer) => row(buffer.app ?? buffer.id, { name: buffer.id })),
            { name: String(thread.buffers.length) },
          ),
        ]
      : []),
  ]);
}

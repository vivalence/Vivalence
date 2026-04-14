import { Vector } from "@vivalence/typology";

export function composeInspector(lighthouse, quarters, bridge, thread) {
  const vector = new Vector();

  const lighthouseBranch = vector.branch({ nature: "lighthouse", directed: { variant: "table" } });
  lighthouseBranch.open({ nature: "authorized", valence: { name: String(lighthouse.$isAuthorized.get()) } });
  lighthouseBranch.open({ nature: "identified", valence: { name: String(lighthouse.$isIdentified.get()) } });
  lighthouseBranch.open({ nature: "status", valence: { name: lighthouse.$status.get()?.code ?? "—" } });
  lighthouseBranch.open({ nature: "identity", valence: { name: lighthouse.$identity.get()?.slug ?? "—" } });
  lighthouseBranch.open({ nature: "connection", valence: { name: lighthouse.connection.$state.get() } });
  lighthouseBranch.open({ nature: "logout", valence: "end session" }, () => lighthouse.logout());

  const daemonsBranch = lighthouseBranch.branch({ nature: "daemons", valence: { name: String(lighthouse.$daemons.get()?.length ?? 0) } });
  for (const daemon of lighthouse.$daemons.get() ?? []) {
    composeDaemon(daemonsBranch, daemon);
  }

  const quartersBranch = vector.branch({ nature: "quarters", directed: { variant: "table" } });
  quartersBranch.open({ nature: "active", valence: { name: quarters.$active.get() ?? "—" } });
  quartersBranch.open({ nature: "terminal", valence: { name: quarters.$terminal.get()?.id ?? "—" } });
  quartersBranch.open({ nature: "spawn", valence: "new terminal" }, () => quarters.spawn());

  const terminalsBranch = quartersBranch.branch({ nature: "terminals", valence: { name: String((quarters.terminals?.$entities?.get?.() ?? []).length) } });
  for (const terminal of quarters.terminals?.$entities?.get?.() ?? []) {
    terminalsBranch.open(
      { nature: terminal.slug ?? terminal.id, valence: { name: terminal.id } },
      () => quarters.activate(terminal.id),
    );
  }

  const bridgeBranch = vector.branch({ nature: "bridge", directed: { variant: "table" } });
  const pincer = bridge.layout.$pincer.get();
  const orientation = bridge.layout.$orientation.get();
  const viewport = bridge.layout.$viewport.get();
  const standard = bridge.layout.$standard.get();
  const previous = bridge.layout.$previous.get();
  bridgeBranch.open({ nature: "pincer", valence: { name: `${Math.round(pincer.x)}·${Math.round(pincer.y)}` } });
  bridgeBranch.open({ nature: "orientation", valence: { name: `${orientation}°` } });
  bridgeBranch.open({ nature: "viewport", valence: { name: `${viewport.width}×${viewport.height}` } });
  bridgeBranch.open({ nature: "standard", valence: { name: `${Math.round(standard.x)}·${Math.round(standard.y)}` } });
  bridgeBranch.open({ nature: "previous", valence: { name: `${Math.round(previous.x)}·${Math.round(previous.y)}` } });

  const threadBranch = vector.branch({ nature: "thread", directed: { variant: "table" } });
  const current = thread.$current.get();
  if (current) {
    threadBranch.open({ nature: "id", valence: { name: current.id ?? "—" } });
    threadBranch.open({ nature: "daemon", valence: { name: current.daemon?.slug ?? String(current.daemon ?? "—") } });
    threadBranch.open({ nature: "mode", valence: { name: current.mode?.slug ?? String(current.mode ?? "—") } });
    if (current.intent) {
      threadBranch.open({ nature: "intent", valence: { name: current.intent?.slug ?? String(current.intent) } });
    }
    threadBranch.open({ nature: "counter", valence: { name: String(current.counter ?? 0) } });
    threadBranch.open({ nature: "cursor", valence: { name: String(current.cursor ?? 0) } });
    threadBranch.open({ nature: "clear", valence: "clear thread" }, () => thread.clear());

    if (current.buffers?.length) {
      const buffersBranch = threadBranch.branch({ nature: "buffers", valence: { name: String(current.buffers.length) } });
      for (const buffer of current.buffers) {
        buffersBranch.open({ nature: buffer.view ?? buffer.id, valence: { name: buffer.id } });
      }
    }
  } else {
    threadBranch.open({ nature: "status", valence: { name: "no active thread" } });
  }

  return vector;
}

function composeDaemon(parent, daemon) {
  const branch = parent.branch({ nature: daemon.slug, directed: { variant: "table" } });
  branch.open({ nature: "connection", valence: { name: daemon.connection?.$state?.get?.() ?? "—" } });
  branch.open({ nature: "slug", valence: { name: daemon.slug ?? "—" } });

  if (daemon.manifest) {
    branch.open({ nature: "traits", valence: { name: (daemon.manifest.traits ?? []).join(", ") || "—" } });
  }

  if (daemon.entities) {
    const entitiesBranch = branch.branch({ nature: "entities", directed: { variant: "table" } });
    const repoNames = ["mode", "intent", "thread", "buffer", "turn", "literal"];

    for (const name of repoNames) {
      const repo = daemon.entities[name];
      if (!repo) continue;
      const entities = repo.$entities?.get?.();
      const count = Array.isArray(entities) ? entities.length : entities instanceof Map ? entities.size : 0;

      if (count > 0) {
        const repoBranch = entitiesBranch.branch({ nature: name, valence: { name: String(count) } });
        for (const entity of Array.isArray(entities) ? entities : [...(entities?.values?.() ?? [])]) {
          repoBranch.open({
            nature: entity.slug ?? entity.id,
            valence: { name: entity.name ?? entity.type ?? entity.view ?? entity.id },
          });
        }
      } else {
        entitiesBranch.open({ nature: name, valence: { name: String(count) } });
      }
    }
  }
}

import { atom } from "nanostores";
import { Vector, shape, steer } from "@vivalence/typology";

export function inspectorAtom(lighthouse, quarters, bridge, top) {
  const $nodes = atom(null);
  const rebuild = () => {
    $nodes.set(shape.tree(composeInspector(lighthouse, quarters, bridge, top), steer.direct));
  };

  for (const source of [
    lighthouse.$status,
    lighthouse.$isAuthorized,
    lighthouse.$isIdentified,
    lighthouse.$identity,
    lighthouse.$daemons,
    top.$active,
    top.$terminal,
    top.$current,
    quarters.terminals.$entities,
    bridge.layout.$pincer,
    bridge.layout.$orientation,
  ]) source.subscribe(rebuild);

  return $nodes;
}

export function composeInspector(lighthouse, quarters, bridge, top) {
  const vector = new Vector();

  const lighthouseBranch = vector.branch({ nature: "lighthouse", directed: { variant: "table" } });
  lighthouseBranch.open({ nature: "authorized", valence: { name: String(lighthouse.isAuthorized) } });
  lighthouseBranch.open({ nature: "identified", valence: { name: String(lighthouse.isIdentified) } });
  lighthouseBranch.open({ nature: "status", valence: { name: lighthouse.status?.code ?? "—" } });
  lighthouseBranch.open({ nature: "identity", valence: { name: lighthouse.identity?.slug ?? "—" } });
  lighthouseBranch.open({ nature: "connection", valence: { name: lighthouse.connection.$state.get() } });
  lighthouseBranch.open({ nature: "logout", valence: "end session" }, () => lighthouse.logout());

  const daemonsBranch = lighthouseBranch.branch({ nature: "daemons", valence: { name: String(lighthouse.$daemons.get()?.length ?? 0) } });
  for (const daemon of lighthouse.$daemons.get() ?? []) {
    composeDaemon(daemonsBranch, daemon);
  }

  const topBranch = vector.branch({ nature: "top", directed: { variant: "table" } });
  topBranch.open({ nature: "terminal", valence: { name: top.terminal?.id ?? "—" } });
  topBranch.open({ nature: "thread", valence: { name: top.current?.id ?? "—" } });
  topBranch.open({ nature: "daemon", valence: { name: top.daemon?.slug ?? String(top.daemon ?? "—") } });
  topBranch.open({ nature: "mode", valence: { name: top.mode?.slug ?? String(top.mode ?? "—") } });
  topBranch.open({ nature: "spawn", valence: "new terminal" }, () => top.spawn());
  if (top.current) {
    topBranch.open({ nature: "clear", valence: "clear thread" }, () => top.clear());
  }

  const quartersBranch = vector.branch({ nature: "quarters", directed: { variant: "table" } });
  const terminalsBranch = quartersBranch.branch({ nature: "terminals", valence: { name: String((quarters.terminals?.$entities?.get?.() ?? []).length) } });
  for (const terminal of quarters.terminals?.$entities?.get?.() ?? []) {
    terminalsBranch.open(
      { nature: terminal.slug ?? terminal.id, valence: { name: terminal.id } },
      () => top.activate(terminal.id),
    );
  }

  const bridgeBranch = vector.branch({ nature: "bridge", directed: { variant: "table" } });
  bridgeBranch.open({ nature: "pincer", valence: { name: `${Math.round(bridge.layout.pincer.x)}·${Math.round(bridge.layout.pincer.y)}` } });
  bridgeBranch.open({ nature: "orientation", valence: { name: `${bridge.layout.orientation}°` } });
  bridgeBranch.open({ nature: "viewport", valence: { name: `${bridge.layout.viewport.width}×${bridge.layout.viewport.height}` } });
  bridgeBranch.open({ nature: "standard", valence: { name: `${Math.round(bridge.layout.standard.x)}·${Math.round(bridge.layout.standard.y)}` } });
  bridgeBranch.open({ nature: "previous", valence: { name: `${Math.round(bridge.layout.previous.x)}·${Math.round(bridge.layout.previous.y)}` } });

  if (top.current) {
    const threadBranch = vector.branch({ nature: "thread", directed: { variant: "table" } });
    threadBranch.open({ nature: "id", valence: { name: top.current.id ?? "—" } });
    if (top.current.intent) {
      threadBranch.open({ nature: "intent", valence: { name: top.current.intent?.slug ?? String(top.current.intent) } });
    }
    threadBranch.open({ nature: "counter", valence: { name: String(top.current.counter ?? 0) } });
    threadBranch.open({ nature: "cursor", valence: { name: String(top.current.cursor ?? 0) } });

    if (top.current.buffers?.length) {
      const buffersBranch = threadBranch.branch({ nature: "buffers", valence: { name: String(top.current.buffers.length) } });
      for (const buffer of top.current.buffers) {
        buffersBranch.open({ nature: buffer.view ?? buffer.id, valence: { name: buffer.id } });
      }
    }
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

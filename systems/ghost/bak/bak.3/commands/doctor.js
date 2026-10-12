import { Vector } from "@vivalence/typology";

const routes = (edge, prefix = "") =>
  Object.entries(edge.branches ?? {}).flatMap(([name, branch]) => {
    const path = `${prefix}/${name}`;
    return [...(branch.effect === undefined || branch.effect === null ? [] : [path]), ...routes(branch, path)];
  });

export const doctor = new Vector().open(
  { nature: "/doctor", valence: "the seat report card — who, which runtime, terminal, thread, mode, its daemon and harness, the dock. Example: doctor" },
  (ctx) => {
    const { client, runtime, terminal } = ctx;
    const thread = terminal === null ? null : terminal.thread;
    const mode = terminal === null ? null : terminal.mode;
    return {
      client: { slug: client.mask.manifest.slug, remote: client.mask.statics.remote.origin },
      user: runtime.lighthouse.isIdentified ? runtime.lighthouse.user.username ?? runtime.lighthouse.user.id : null,
      lighthouse: runtime.lighthouse.status.code,
      runtime: { reference: runtime.reference === null ? null : runtime.reference.absolute, status: runtime.status.code, daemons: runtime.daemons.length },
      terminal: terminal === null ? null : { id: terminal.id, index: terminal.index, label: terminal.label, of: client.terminals.entities.length },
      thread: thread === null ? null : { id: thread.id, label: thread.label === null ? null : thread.label.name, phase: thread.phase, traits: thread.traits },
      mode: mode === null ? null : { reference: mode.reference.absolute, type: mode.type, slug: mode.slug, traits: mode.traits },
      daemon: mode === null ? null : { reference: mode.host.reference.absolute, status: mode.host.status.code, modes: mode.host.modes.length },
      harness: mode === null || mode.harness === undefined ? null : routes(mode.metadata.harness),
      buffer: terminal === null || terminal.buffer === null ? null : terminal.buffer.id,
      dock: client.dock,
    };
  },
);

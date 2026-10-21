import { Vector } from "@vivalence/typology";

export const doctor = new Vector().open(
  { nature: "/doctor", valence: "the seat report card — who, which runtime, terminal, thread, mode, its daemon, the dock. Example: /doctor" },
  (ctx) => {
    const { runtime } = ctx.client;
    const thread = ctx.terminal.thread;
    const mode = ctx.terminal.mode;
    return {
      client: { slug: ctx.client.mask.manifest.slug, remote: ctx.client.mask.statics.remote.origin },
      user: runtime.lighthouse.user === null ? null : runtime.lighthouse.user.username ?? runtime.lighthouse.user.id,
      lighthouse: runtime.lighthouse.status.code,
      runtime: { reference: runtime.reference.absolute, standing: runtime.status.code, daemons: runtime.entities.daemon.$entities.get().length },
      terminal: { id: ctx.terminal.id, index: ctx.terminal.index, of: runtime.entities.terminal.$entities.get().length },
      thread: thread === null ? null : { id: thread.id, label: thread.trait.LABELED.name, traits: thread.traits },
      mode: mode === null ? null : { reference: mode.reference.absolute, type: mode.type, slug: mode.slug, traits: mode.traits },
      daemon: mode === null || mode.daemon === null ? null : { reference: mode.daemon.reference.absolute, standing: mode.daemon.status.code, modes: mode.daemon.modes.length },
      buffer: ctx.terminal.buffer === null ? null : ctx.terminal.buffer.id,
      dock: ctx.terminal.dock,
    };
  },
);

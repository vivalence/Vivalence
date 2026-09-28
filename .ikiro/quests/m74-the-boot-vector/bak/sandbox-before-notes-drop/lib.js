import { RequestContext, types } from "@mikro-orm/core";
import { Aperture, Controller, Mode, Path, Span, Url, Vector, control, shard, steer, v } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/runtime";
import { provider } from "./datamap.class.js";

export class ProcessEntity extends VirtualEntity {
  slug = "";
  mask = null;
  subject = null;
  controller = null;
  execution = null;

  get status() {
    return this.controller?.status.reflection.code ?? null;
  }

  get $status() {
    return this.controller?.status.$transient ?? null;
  }
}

export class ProcessRepository extends VirtualRepository {
  async execute(run, held, die) {
    if (held.execution) throw new Error(`ProcessEntity ${held.id} is executed`);
    held.execution = steer.dispatch.execute(run, { controller: held.controller, mask: held.mask, ...die });
    await control.controlled(held.controller);
    return held;
  }

  async kill(signal, where = {}) {
    const processes = await this.find(where);
    await Promise.all(processes.map((process) => process.controller.kill(signal)));
    if (["stop", "abort"].includes(v.primitives.controller.MACHINE.signals[signal])) await Promise.all(processes.map((process) => process.execution));
  }

  census() {
    return Object.fromEntries(this.$entities.get().map((process) => [process.slug, process.status]));
  }

  async removeOne(where) {
    const process = await this.findOneOrFail(where);
    if (!v.primitives.controller.MACHINE.states[process.status].settled) await process.controller.kill("SIGKILL");
    return super.removeOne({ id: process.id });
  }
}

export const ProcessSchema = new VirtualSchema({
  class: ProcessEntity,
  repository: () => ProcessRepository,
  properties: {
    slug: { type: types.string },
    mask: { type: "any", persist: false, hidden: true, nullable: true },
    subject: { type: "any", persist: false, hidden: true, nullable: true },
    controller: { type: "any", persist: false, hidden: true, nullable: true },
    execution: { type: "any", persist: false, hidden: true, nullable: true },
    status: { type: types.string, persist: false, getter: true, nullable: true },
  },
});

export const process = { type: "process", schema: ProcessSchema, entity: ProcessEntity, repository: ProcessRepository };

export class Daemon {
  manifest = null;
  mount = null;
  url = null;
  aperture = new Aperture();
  datamap = null;
  processes = {};

  constructor(fields) {
    Object.assign(this, fields);
  }

  get modes() {
    const modes = {};
    for (const mode of this.flatmodes()) (modes[mode.manifest.type] ??= {})[mode.manifest.slug] = mode;
    return modes;
  }

  get domain() {
    return this.flatmodes().find((mode) => mode.manifest.type === "domain") ?? null;
  }

  flatmodes() {
    return (this.processes.mode?.$entities.get() ?? []).map((process) => process.subject);
  }
}

const trail = [];
export const log = trail;
export const seen = { contexts: [] };

const bracket = (name) => async (die, next) => {
  trail.push(`${die.controller.stdout.absolute} ${name}+`);
  await next();
  trail.push(`${die.controller.stdout.absolute} ${name}-`);
};

const refusing = async (die, next) => {
  if (die.mask.fails === "boot") throw new Error(`${die.mask.manifest.slug} refused`);
  await next();
};

const STAGGERED = async (mode) => {
  trail.push(`${mode.manifest.slug} stagger`);
  return {
    finalize: async () => trail.push(`${mode.manifest.slug} finalize`),
    terminate: async () => trail.push(`${mode.manifest.slug} terminate`),
  };
};

export const lifecycle = {
  process: {
    seal: async (die, next) => {
      try {
        await next();
      } catch (error) {
        die.controller.stdout.fault(error);
      } finally {
        die.controller.stdout.close();
      }
    },
    live: async (die) => {
      die.controller.stdout.open();
      await control.hold(die.controller);
    },
  },
  runtime: {
    population: {
      datamap: async (die, next) => {
        die.runtime.datamap = await provider({ statics: { context: { name: `runtime-${crypto.randomUUID()}` } } }, { entities: [ProcessSchema] });
        die.runtime.processes = { service: new ProcessRepository(die.runtime.datamap.orm.em, ProcessEntity), daemon: new ProcessRepository(die.runtime.datamap.orm.em, ProcessEntity) };
        try {
          await next();
        } finally {
          await die.runtime.datamap.close();
        }
      },
      aperture: async (die, next) => {
        die.runtime.aperture.open("/status", () => die.controller.status).open("/manifest", () => die.mask.manifest);
        await next();
      },
      services: async (die, next) => {
        await die.runtime.datamap.shard.scope(() =>
          Promise.all(
            die.runtime.instance.services.map((mask) =>
              die.runtime.processes.service.create({ slug: mask.manifest.slug, mask, subject: { manifest: mask.manifest, aperture: new Aperture() }, controller: die.controller.branch(mask.mount.absolute) }),
            ),
          ),
        );
        try {
          await next();
        } finally {
          await die.runtime.processes.service.remove();
        }
      },
      daemons: async (die, next) => {
        await die.runtime.datamap.shard.scope(() =>
          Promise.all(
            die.runtime.instance.daemons.map((mask) =>
              die.runtime.processes.daemon.create({ slug: mask.manifest.slug, mask, subject: new Daemon({ manifest: mask.manifest, mount: mask.mount, url: mask.url }), controller: die.controller.branch(mask.mount.absolute) }),
            ),
          ),
        );
        try {
          await next();
        } finally {
          await die.runtime.processes.daemon.remove();
        }
      },
    },
    resolution: {
      services: (run) => async (die, next) => {
        try {
          for (const held of await die.runtime.processes.service.find()) await die.runtime.processes.service.execute(run, held, { service: held.subject });
          await next();
        } finally {
          await die.runtime.processes.service.kill("SIGTERM");
        }
      },
      daemons: (run) => async (die, next) => {
        try {
          for (const held of await die.runtime.processes.daemon.find()) await die.runtime.processes.daemon.execute(run, held, { daemon: held.subject });
          await next();
        } finally {
          await die.runtime.processes.daemon.kill("SIGTERM");
        }
      },
      expose: async (die, next) => {
        for (const held of await die.runtime.processes.daemon.find()) {
          const branch = die.runtime.aperture.branch(held.subject.mount.absolute);
          branch.branch("/status").slurp(shard.nano.atom(held.$status));
          branch.open("/manifest", () => held.subject.manifest).slurp(held.subject.aperture);
        }
        for (const held of await die.runtime.processes.service.find()) {
          die.runtime.aperture.branch(held.mask.mount.absolute).open("/status", () => held.controller.status).slurp(held.subject.aperture);
        }
        await next();
      },
    },
    integration: {
      patrol: async (die, next) => {
        const beat = setInterval(() => die.controller.stdout.note({ service: die.runtime.processes.service.census(), daemon: die.runtime.processes.daemon.census() }), die.runtime.beat ?? 60000);
        try {
          await next();
        } finally {
          clearInterval(beat);
        }
      },
    },
  },
  service: {
    aperture: async (die, next) => {
      die.service.aperture.open("/ping", () => ({ pong: die.service.manifest.slug }));
      await next();
    },
  },
  daemon: {
    population: {
      core: async (die, next) => {
        die.register = { kernel: die.mask.kernel, secrets: { key: "sk-held-on-the-die" } };
        await next();
      },
      datamap: async (die, next) => {
        die.daemon.datamap = await provider({ statics: { context: { name: `daemon-${crypto.randomUUID()}` } } }, { entities: [ProcessSchema] });
        die.daemon.processes = { mode: new ProcessRepository(die.daemon.datamap.orm.em, ProcessEntity) };
        try {
          await next();
        } finally {
          await die.daemon.datamap.close();
          trail.push(`${die.daemon.manifest.slug} datamap closed`);
        }
      },
      modes: async (die, next) => {
        await die.daemon.datamap.shard.scope(() =>
          Promise.all(
            die.register.kernel.map((mask) =>
              die.daemon.processes.mode.create({
                slug: `${mask.manifest.type}/${mask.manifest.slug}`,
                mask,
                subject: new Mode({ manifest: { traits: ["STAGGERED"], ...mask.manifest }, mount: mask.mount, aperture: new Aperture() }),
                controller: die.controller.branch(mask.mount.absolute),
              }),
            ),
          ),
        );
        try {
          await next();
        } finally {
          await die.daemon.processes.mode.remove();
        }
      },
    },
    resolution: {
      domain: async (die, next) => {
        trail.push(`${die.daemon.manifest.slug} domain`);
        await next();
      },
      modes: (run) => async (die, next) => {
        try {
          for (const held of await die.daemon.processes.mode.find()) await die.daemon.processes.mode.execute(run, held, { mode: held.subject, daemon: die.daemon });
          await Promise.all(die.daemon.flatmodes().flatMap((mode) => mode.finalizers ?? []).map((finalize) => finalize()));
          for (const mode of die.daemon.flatmodes()) die.daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture);
          await next();
        } finally {
          await die.daemon.processes.mode.kill("SIGTERM");
        }
      },
    },
    aperture: {
      ping: async (die, next) => {
        die.daemon.aperture.use(shard.context.bind("daemon", die.daemon)).open("/ping", (ctx) => ({ pong: ctx.daemon.manifest.slug, keys: Object.keys(ctx.daemon).sort() }));
        await next();
      },
    },
  },
  mode: {
    core: async (die, next) => {
      seen.contexts.push({ at: die.controller.stdout.absolute, inherited: Boolean(RequestContext.currentRequestContext()) });
      die.mode.aperture.open("/status", () => die.controller.status);
      await next();
    },
    traits: async (die, next) => {
      const held = await STAGGERED(die.mode, die.daemon);
      die.mode.finalizers = [held.finalize];
      die.mode.terminators = [held.terminate];
      try {
        await next();
      } finally {
        for (const terminate of die.mode.terminators) await terminate();
      }
    },
  },
};

const { seal, live } = lifecycle.process;

export const mode = new Vector().use(seal).use(refusing).use(lifecycle.mode.core).use(lifecycle.mode.traits);
mode.affect(live);

export const daemon = new Vector()
  .use(seal)
  .use(refusing)
  .use(lifecycle.daemon.population.core)
  .use(lifecycle.daemon.population.datamap)
  .use(lifecycle.daemon.population.modes)
  .use(lifecycle.daemon.resolution.domain)
  .use(lifecycle.daemon.resolution.modes(mode))
  .use(lifecycle.daemon.aperture.ping);
daemon.affect(live);

export const service = new Vector().use(seal).use(lifecycle.service.aperture);
service.affect(live);

export const runtime = new Vector()
  .use(seal)
  .use(bracket("registry"))
  .use(lifecycle.runtime.population.datamap)
  .use(lifecycle.runtime.population.aperture)
  .use(lifecycle.runtime.population.services)
  .use(lifecycle.runtime.population.daemons)
  .use(lifecycle.runtime.resolution.services(service))
  .use(lifecycle.runtime.resolution.daemons(daemon))
  .use(lifecycle.runtime.resolution.expose)
  .use(lifecycle.runtime.integration.patrol)
  .use(bracket("serve"));
runtime.affect(live);

export const run = { runtime, service, daemon, mode };

export const mint = (overrides = {}) => {
  trail.length = 0;
  seen.contexts.length = 0;
  const instance = {
    services: [{ manifest: { type: "lighthouse", slug: "multiplayer" }, secrets: { jwt: "held-in-clear" }, mount: new Path("/attached/process/service/lighthouse/multiplayer") }],
    daemons: [
      {
        manifest: { type: "daemon", slug: "chess" },
        mount: new Path("/daemon/chess"),
        url: new Url("http://localhost:2501/daemon/chess"),
        kernel: [
          { manifest: { type: "game", slug: "board" }, mount: new Path("/mode/game/board") },
          { manifest: { type: "game", slug: "puzzles" }, mount: new Path("/mode/game/puzzles") },
        ],
        ...overrides.chess,
      },
      { manifest: { type: "daemon", slug: "education" }, mount: new Path("/daemon/education"), url: new Url("http://localhost:2501/daemon/education"), kernel: [{ manifest: { type: "teacher", slug: "iroh" }, mount: new Path("/mode/teacher/iroh") }], ...overrides.education },
    ],
  };
  const die = {
    controller: new Controller({ stdout: new Span("runtime/test") }),
    mask: { manifest: { slug: "test" } },
    runtime: { instance, datamap: null, processes: null, aperture: new Aperture(), beat: overrides.beat },
  };
  return die;
};

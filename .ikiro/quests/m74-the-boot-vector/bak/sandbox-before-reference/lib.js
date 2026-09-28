import { RequestContext, types } from "@mikro-orm/core";
import { Aperture, Controller, Mode, Path, Span, Url, Vector, control, shard, steer, v } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/runtime";
import { provider } from "./datamap.class.js";

export class ProcessEntity extends VirtualEntity {
  type = "";
  slug = "";
  mask = null;
  controller = null;
  execution = null;

  get manifest() {
    return this.mask.manifest;
  }

  get mount() {
    return this.mask.mount;
  }

  get $status() {
    return this.controller?.status.$transient ?? null;
  }

  get status() {
    return this.controller?.status.reflection.code ?? null;
  }

  async execute(run) {
    if (this.execution) throw new Error(`${this.type} ${this.slug} is executed`);
    this.execution = steer.dispatch.execute(run, { controller: this.controller, mask: this.mask, [this.type]: this });
    await control.controlled(this.controller);
    return this;
  }
}

export class ProcessRepository extends VirtualRepository {
  async create(data) {
    if (await this.findOne({ slug: data.slug })) throw new Error(`${data.slug} is held`);
    return super.create(data);
  }

  async kill(where, signal) {
    const { signals, transitions } = v.primitives.controller.MACHINE;
    const processes = await this.find(where);
    await Promise.all(processes.filter((process) => transitions[signals[signal]][process.status]).map((process) => process.controller.kill(signal)));
    if (["stop", "abort"].includes(signals[signal])) await Promise.all(processes.map((process) => process.execution));
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
    type: { type: types.string },
    slug: { type: types.string },
    mask: { type: "any", persist: false, hidden: true, nullable: true },
    controller: { type: "any", persist: false, hidden: true, nullable: true },
    execution: { type: "any", persist: false, hidden: true, nullable: true },
    status: { type: types.string, persist: false, getter: true, nullable: true },
  },
});

export const process = { type: "process", schema: ProcessSchema, entity: ProcessEntity, repository: ProcessRepository };

export class Service extends ProcessEntity {
  type = "service";
  aperture = new Aperture();
}

export class Daemon extends ProcessEntity {
  type = "daemon";
  aperture = new Aperture();
  datamap = null;
  domain = null;
  modes = {};

  get url() {
    return this.mask.url;
  }

  flatmodes() {
    return Object.values(this.modes).flatMap((type) => Object.values(type));
  }
}

export const ServiceSchema = new VirtualSchema({ class: Service, extends: ProcessSchema, repository: () => ProcessRepository, properties: {} });
export const DaemonSchema = new VirtualSchema({ class: Daemon, extends: ProcessSchema, repository: () => ProcessRepository, properties: {} });

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
    settle: async (die, next) => {
      try {
        await next();
      } catch (error) {
        die.controller.stdout.fault(error);
      } finally {
        die.controller.stdout.close();
      }
    },
    keepalive: async (die) => {
      die.controller.stdout.open();
      await control.hold(die.controller);
    },
  },
  runtime: {
    population: {
      datamap: async (die, next) => {
        die.runtime.datamap = await provider({ statics: { context: { name: `runtime-${crypto.randomUUID()}` } } }, { entities: [ProcessSchema, ServiceSchema, DaemonSchema] });
        die.runtime.processes = { service: new ProcessRepository(die.runtime.datamap.orm.em, Service), daemon: new ProcessRepository(die.runtime.datamap.orm.em, Daemon) };
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
              die.runtime.processes.service.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.mount.absolute) }),
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
              die.runtime.processes.daemon.create({ slug: mask.manifest.slug, mask, controller: die.controller.branch(mask.mount.absolute) }),
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
          for (const service of await die.runtime.processes.service.find()) await service.execute(run);
          await next();
        } finally {
          await die.runtime.processes.service.kill({}, "SIGTERM");
        }
      },
      daemons: (run) => async (die, next) => {
        try {
          for (const daemon of await die.runtime.processes.daemon.find()) await daemon.execute(run);
          await next();
        } finally {
          await die.runtime.processes.daemon.kill({}, "SIGTERM");
        }
      },
      expose: async (die, next) => {
        for (const daemon of await die.runtime.processes.daemon.find()) {
          const branch = die.runtime.aperture.branch(daemon.mount.absolute);
          branch.branch("/status").slurp(shard.nano.atom(daemon.$status));
          branch.open("/manifest", () => daemon.manifest).slurp(daemon.aperture);
        }
        for (const service of await die.runtime.processes.service.find()) die.runtime.aperture.branch(service.mount.absolute).slurp(service.aperture);
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
      die.service.aperture.open("/status", () => die.controller.status).open("/ping", () => ({ pong: die.service.manifest.slug }));
      await next();
    },
  },
  daemon: {
    population: {
      core: async (die, next) => {
        die.register = { kernel: die.mask.kernel, domain: die.mask.kernel.find((mask) => mask.manifest.type === "domain") ?? {}, secrets: { key: "sk-held-on-the-die" } };
        die.daemon.domain = die.register.domain;
        die.instance = { traits: { STAGGERED } };
        await next();
      },
      datamap: async (die, next) => {
        die.daemon.datamap = await provider({ statics: { context: { name: `daemon-${crypto.randomUUID()}` } } }, { entities: [ProcessSchema] });
        try {
          await next();
        } finally {
          await die.daemon.datamap.close();
          trail.push(`${die.daemon.manifest.slug} datamap closed`);
        }
      },
      modes: async (die, next) => {
        for (const mask of die.register.kernel)
          (die.daemon.modes[mask.manifest.type] ??= {})[mask.manifest.slug] = new Mode({ manifest: { traits: ["STAGGERED"], ...mask.manifest }, mount: mask.mount, fails: mask.fails, aperture: new Aperture(), stdout: die.controller.stdout.branch(mask.mount.absolute) });
        await next();
      },
    },
    resolution: {
      domain: async (die, next) => {
        trail.push(`${die.daemon.manifest.slug} domain`);
        await next();
      },
      modes: (run) => async (die, next) => {
        try {
          for (const mode of die.daemon.flatmodes()) await steer.dispatch.execute(run, { mask: mode.module, mode, daemon: die.daemon, traits: die.instance.traits });
          await Promise.all(die.daemon.flatmodes().flatMap((mode) => mode.finalizers ?? []).map((finalize) => finalize()));
          for (const mode of die.daemon.flatmodes()) die.daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture);
          await next();
        } finally {
          for (const mode of die.daemon.flatmodes()) {
            for (const terminate of mode.terminators ?? []) await terminate();
            mode.stdout.close();
          }
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
    population: {
      stdout: async (die, next) => {
        try {
          await next();
          die.mode.stdout.open();
        } catch (error) {
          die.mode.stdout.fault(error);
          throw error;
        }
      },
      core: async (die, next) => {
        seen.contexts.push({ at: die.mode.stdout.absolute, inherited: Boolean(RequestContext.currentRequestContext()) });
        if (die.mode.fails === "boot") throw new Error(`${die.mode.manifest.slug} refused`);
        die.mode.aperture.open("/ping", () => ({ pong: die.mode.manifest.slug }));
        await next();
      },
    },
    resolution: {
      traits: async (die) => {
        const finalizers = [];
        for (const trait of die.mode.manifest.traits) {
          const staggered = await die.traits[trait](die.mode, die.daemon);
          finalizers.push(staggered.finalize);
          (die.mode.terminators ??= []).push(staggered.terminate);
        }
        die.mode.finalizers = finalizers;
      },
    },
  },
};

const { settle, keepalive } = lifecycle.process;

export const mode = new Vector().use(lifecycle.mode.population.stdout).use(lifecycle.mode.population.core);
mode.affect(lifecycle.mode.resolution.traits);

export const daemon = new Vector()
  .use(settle)
  .use(refusing)
  .use(lifecycle.daemon.population.core)
  .use(lifecycle.daemon.population.datamap)
  .use(lifecycle.daemon.population.modes)
  .use(lifecycle.daemon.resolution.domain)
  .use(lifecycle.daemon.resolution.modes(mode))
  .use(lifecycle.daemon.aperture.ping);
daemon.affect(keepalive);

export const service = new Vector().use(settle).use(lifecycle.service.aperture);
service.affect(keepalive);

export const runtime = new Vector()
  .use(settle)
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
runtime.affect(keepalive);

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

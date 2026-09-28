import { MikroORM, RequestContext, types } from "@mikro-orm/core";
import { Aperture, Controller, Mode, Path, Span, Url, Vector, control, shard, steer, v } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/runtime";
import { config } from "../../../../commons/datamaps/libsql/libsql.viva.js";

export class ProcessEntity extends VirtualEntity {
  type = "";
  slug = "";
  manifest = {};
  mask = null;
  controller = null;
  execution = null;
  get status() {
    return this.controller?.status.reflection.code ?? null;
  }
}

export class ProcessRepository extends VirtualRepository {
  async controlled({ id, execution }) {
    const process = await this.findOneOrFail({ id });
    if (process.execution) throw new Error(`ProcessEntity ${id} is executed`);
    process.execution = execution;
    return process;
  }

  async stop(processes) {
    for (const { controller } of processes) {
      if (controller.status.is("IDLE")) await controller.kill("SIGKILL");
      if (controller.status.is(["RUNNING", "PAUSED"])) await controller.kill("SIGTERM");
    }
    await Promise.all(processes.map((process) => process.execution));
  }

  async removeOne(where) {
    const process = await this.findOneOrFail(where);
    const { code } = process.controller.status.reflection;
    if (!v.primitives.controller.MACHINE.states[code].settled) await process.controller.kill("SIGKILL");
    return super.removeOne({ id: process.id });
  }
}

export const ProcessSchema = new VirtualSchema({
  class: ProcessEntity,
  repository: () => ProcessRepository,
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    manifest: { type: types.json },
    mask: { type: "any", persist: false, hidden: true, nullable: true },
    controller: { type: "any", persist: false, hidden: true, nullable: true },
    execution: { type: "any", persist: false, hidden: true, nullable: true },
    status: { type: types.string, persist: false, getter: true, nullable: true },
  },
});

export const process = { type: "process", schema: ProcessSchema, entity: ProcessEntity, repository: ProcessRepository };

const provider = async (descriptors) => {
  const orm = await MikroORM.init(config({ dbName: ":memory:", contextName: `sandbox-${crypto.randomUUID()}`, entities: descriptors.map((descriptor) => descriptor.schema) }));
  const entities = { em: orm.em };
  for (const { type, entity } of descriptors) entities[type] = orm.em.getRepository(entity);
  return {
    entities,
    shard: { scope: (task) => RequestContext.create(orm.em, task) },
    introspect: () => orm.getMetadata(),
    disintegrate: () => orm.close(),
  };
};

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
    effect: async (die) => {
      die.controller.stdout.open();
      await control.hold(die.controller);
    },
  },
  runtime: {
    population: {
      datamap: async (die, next) => {
        die.runtime.datamap = await provider([process]);
        die.runtime.entities = die.runtime.datamap.entities;
        try {
          await next();
        } finally {
          await die.runtime.datamap.disintegrate();
        }
      },
      aperture: async (die, next) => {
        die.runtime.aperture.open("/status", () => die.controller.status.reflection).open("/manifest", () => die.mask.manifest);
        await next();
      },
      services: async (die, next) => {
        const { process } = die.runtime.entities;
        await die.runtime.datamap.shard.scope(() =>
          Promise.all(
            die.runtime.instance.services.map((mask) => {
              die.runtime.services[mask.manifest.slug] = { manifest: mask.manifest, aperture: new Aperture() };
              return process.create({ type: "service", slug: mask.manifest.slug, manifest: mask.manifest, mask, controller: die.controller.branch(mask.mount.absolute) });
            }),
          ),
        );
        try {
          await next();
        } finally {
          await process.remove({ type: "service" });
        }
      },
      daemons: async (die, next) => {
        const { process } = die.runtime.entities;
        await die.runtime.datamap.shard.scope(() =>
          Promise.all(
            die.runtime.instance.daemons.map((mask) => {
              die.runtime.daemons[mask.manifest.slug] = { manifest: mask.manifest, mount: mask.mount, url: mask.url, aperture: new Aperture(), modes: {}, flatmodes() { return Object.values(this.modes).flatMap((type) => Object.values(type)); } };
              return process.create({ type: "daemon", slug: mask.manifest.slug, manifest: mask.manifest, mask, controller: die.controller.branch(mask.mount.absolute) });
            }),
          ),
        );
        try {
          await next();
        } finally {
          await process.remove({ type: "daemon" });
        }
      },
    },
    resolution: {
      services: (run) => async (die, next) => {
        const { process } = die.runtime.entities;
        const processes = await process.find({ type: "service" });
        try {
          for (const held of processes) {
            const execution = steer.dispatch.execute(run, { controller: held.controller, mask: held.mask, service: die.runtime.services[held.slug] });
            await process.controlled({ id: held.id, execution });
            await control.controlled(held.controller);
          }
          await next();
        } finally {
          await process.stop(processes);
        }
      },
      daemons: (run) => async (die, next) => {
        const { process } = die.runtime.entities;
        const processes = await process.find({ type: "daemon" });
        try {
          for (const held of processes) {
            const execution = steer.dispatch.execute(run, { controller: held.controller, mask: held.mask, daemon: die.runtime.daemons[held.slug] });
            await process.controlled({ id: held.id, execution });
            await control.controlled(held.controller);
          }
          await next();
        } finally {
          await process.stop(processes);
        }
      },
      expose: async (die, next) => {
        for (const held of await die.runtime.entities.process.find({ type: "daemon" })) {
          const daemon = die.runtime.daemons[held.slug];
          const branch = die.runtime.aperture.branch(daemon.mount.absolute);
          branch.branch("/status").slurp(shard.nano.atom(held.controller.status.$transient));
          branch.open("/manifest", () => daemon.manifest).slurp(daemon.aperture);
        }
        for (const held of await die.runtime.entities.process.find({ type: "service" })) {
          die.runtime.aperture.branch(held.mask.mount.absolute).open("/status", () => held.controller.status.reflection).slurp(die.runtime.services[held.slug].aperture);
        }
        await next();
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
        die.daemon.datamap = await provider([process]);
        die.daemon.entities = die.daemon.datamap.entities;
        try {
          await next();
        } finally {
          await die.daemon.datamap.disintegrate();
          trail.push(`${die.daemon.manifest.slug} datamap closed`);
        }
      },
      modes: async (die, next) => {
        const { process } = die.daemon.entities;
        await die.daemon.datamap.shard.scope(() =>
          Promise.all(
            die.register.kernel.map((mask) => {
              const mode = new Mode({ manifest: { traits: ["STAGGERED"], ...mask.manifest }, mount: mask.mount });
              mode.aperture = new Aperture();
              (die.daemon.modes[mode.manifest.type] ??= {})[mode.manifest.slug] = mode;
              return process.create({ type: "mode", slug: `${mask.manifest.type}/${mask.manifest.slug}`, manifest: mask.manifest, mask, controller: die.controller.branch(mask.mount.absolute) });
            }),
          ),
        );
        try {
          await next();
        } finally {
          await process.remove({ type: "mode" });
        }
      },
    },
    resolution: {
      domain: async (die, next) => {
        trail.push(`${die.daemon.manifest.slug} domain`);
        await next();
      },
      modes: (run) => async (die, next) => {
        const { process } = die.daemon.entities;
        const processes = await process.find({ type: "mode" });
        try {
          for (const held of processes) {
            const mode = die.daemon.modes[held.manifest.type][held.manifest.slug];
            const execution = steer.dispatch.execute(run, { controller: held.controller, mask: held.mask, mode, daemon: die.daemon });
            await process.controlled({ id: held.id, execution });
            await control.controlled(held.controller);
          }
          await Promise.all(die.daemon.flatmodes().flatMap((mode) => mode.finalizers ?? []).map((finalize) => finalize()));
          for (const mode of die.daemon.flatmodes()) die.daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture);
          await next();
        } finally {
          await process.stop(processes);
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
      die.mode.aperture.open("/status", () => die.controller.status.reflection);
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

const { seal, effect } = lifecycle.process;

export const mode = new Vector().use(seal).use(refusing).use(lifecycle.mode.core).use(lifecycle.mode.traits);
mode.affect(effect);

export const daemon = new Vector()
  .use(seal)
  .use(refusing)
  .use(lifecycle.daemon.population.core)
  .use(lifecycle.daemon.population.datamap)
  .use(lifecycle.daemon.population.modes)
  .use(lifecycle.daemon.resolution.domain)
  .use(lifecycle.daemon.resolution.modes(mode))
  .use(lifecycle.daemon.aperture.ping);
daemon.affect(effect);

export const service = new Vector().use(seal).use(lifecycle.service.aperture);
service.affect(effect);

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
  .use(bracket("serve"));
runtime.affect(effect);

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
    runtime: { instance, datamap: null, entities: null, aperture: new Aperture(), daemons: {}, services: {} },
  };
  return die;
};

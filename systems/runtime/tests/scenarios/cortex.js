import { shard, Mode, Path, shape, Aperture, Vector, Cortex } from "@vivalence/typology";
import { seed, tiers, faculties } from "./fixtures.js";

import { HARNESSED } from "@vivalence/runtime/daemon/traits";

export async function create({ harness } = {}) {
  const { orm, em, datamap, entities, fixtures } = await seed();

  const deweyEntity = em.create(tiers.mode.entity, {
    slug: "dewey",
    type: "teacher",
    traits: ["EXPOSED", "HARNESSED"],
    installed: "installed",
  });
  await em.flush();

  const cortex = new Cortex().register(faculties());

  const dewey = new Mode({
    manifest: { type: "teacher", slug: "dewey", traits: ["EXPOSED", "HARNESSED"] },
  });
  dewey.aperture = new Aperture();
  dewey.mount = new Path(`/mode/${dewey.type}/${dewey.slug}`);
  dewey.entity = deweyEntity;
  dewey.id = deweyEntity.id;
  dewey.module.tune = "balanced";

  dewey.module.harness = harness ?? new Vector();
  if (!harness) {
    dewey.module.harness.branch("/dialogue").use(async (ctx, next) => {
      ctx.hallucination.system.dewey = "You are Dewey, a patient language tutor.";
      await next();
    });
  }

  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    twitch: new Vector(),
    entities,
    modes: { teacher: { dewey } },
    cortex,
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  daemon.aperture.use(shard.context.bind("daemon", daemon));
  datamap.subscribe(shape.subscriber(daemon.twitch));

  const finalizer = HARNESSED(dewey, daemon);
  if (typeof finalizer === "function") await finalizer();

  daemon.aperture.branch(dewey.mount.absolute).slurp(dewey.aperture);

  const createThread = async () => {
    const thread = em.create(tiers.thread.entity, {
      user: fixtures.user,
      mode: deweyEntity,
      trait: {},
      cursor: 0,
      counter: 0,
    });
    await em.flush();
    return thread;
  };

  return {
    daemon,
    dewey,
    cortex,
    orm,
    em,
    datamap,
    fixtures: { ...fixtures, dewey: deweyEntity },
    createThread,
  };
}

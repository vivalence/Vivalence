import { Aperture, contexts, Cortex, Mode, Path, shard, Twitch, Vector } from "@vivalence/typology";
import { seed, tiers, faculties } from "./fixtures.js";

import { traits } from "@vivalence/runtime";
const { HARNESSED } = traits.mode;

export async function create({ harness } = {}) {
  const { orm, em, datamap, entities, runtime, twitch, fixtures, held } = await seed();

  const deweyEntity = entities.mode.create({
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
  dewey.reference = new Path(`/mode/${dewey.type}/${dewey.slug}`);
  dewey.entity = deweyEntity;
  dewey.id = deweyEntity.id;
  dewey.module.tune = "balanced";

  dewey.module.harness = harness ?? new Vector();
  if (!harness) {
    dewey.module.harness.branch("/dialogue").use(async (ctx, next) => {
      ctx.hallucination.primer.open("dewey", "You are Dewey, a patient language tutor.");
      await next();
    });
  }

  const daemon = Object.assign(held, { type: "daemon", aperture: new Aperture(), modes: { teacher: { dewey } }, cortex });

  daemon.aperture.use(shard.context.spread(contexts.host, daemon));

  const finalizer = HARNESSED(dewey, daemon);
  if (typeof finalizer === "function") await finalizer();

  daemon.aperture.branch(dewey.reference.absolute, dewey.aperture);

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
    entities,
    runtime,
    twitch,
    fixtures: { ...fixtures, dewey: deweyEntity },
    createThread,
  };
}

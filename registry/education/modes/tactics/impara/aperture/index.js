import { v, Vector } from "@vivalence/typology";

import { buckets } from "../course.js";

export const aperture = new Vector().open(
  {
    nature: "/course/open",
    input: v.object({}),
    output: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        mount: v.string(),
        phase: v.string(),
        created: v.boolean(),
      }),
    ),
  },
  async (ctx) => {
    const existing = await ctx.daemon.entities.thread.find({
      mode: ctx.mode.id,
      user: ctx.user.id,
    });
    const byMount = new Map(
      existing.map((thread) => [thread.trait?.AIMED?.mount, thread]),
    );

    const opened = [];
    for (const bucket of buckets) {
      const mount = bucket.trait.AIMED.mount;
      const found = byMount.get(mount);
      if (found) {
        opened.push({ bucket, mount, thread: found, created: false });
        continue;
      }

      const thread = await ctx.daemon.entities.thread.create({
        user: ctx.user.id,
        mode: ctx.mode.id,
        phase: "continuous",
        traits: bucket.traits,
        trait: bucket.trait,
      });
      opened.push({ bucket, mount, thread, created: true });
    }

    await ctx.daemon.entities.em.flush();

    return opened.map(({ bucket, mount, thread, created }) => ({
      id: thread.id,
      name: bucket.name,
      mount,
      phase: thread.phase,
      created,
    }));
  },
);

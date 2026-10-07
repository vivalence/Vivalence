import { specimen, Aperture, Path, sleep } from "@vivalence/typology";
import { lifecycle } from "@vivalence/runtime";
import { lighthouse } from "../scenarios/index.js";

const SLUGS = ["italian", "spanish"];

specimen.describe("a daemon's twitch — its own Twitch, the daemon bound, a foreign daemon's rows dropped before dispatch", () => {
  let scenario;
  const daemons = {};
  const heard = Object.fromEntries(SLUGS.map((slug) => [slug, []]));
  const kernel = [];

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    scenario.runtime.twitch.open("/after/literal/create", (ctx) => kernel.push(ctx.input.entity.slug));
    for (const slug of SLUGS) {
      await scenario.seedDaemon(slug);
      const die = { runtime: scenario.runtime, daemon: { type: "daemon", slug, reference: new Path(`/daemon/${slug}`), domain: {}, aperture: new Aperture() }, register: { modes: [] } };
      await lifecycle.daemon.population.datamap(die, async () => {});
      die.daemon.twitch.open("/after/literal/create", (ctx) => heard[slug].push(`${ctx.input.entity.daemon.slug}:${ctx.input.entity.slug}`));
      daemons[slug] = die.daemon;
    }
    await scenario.datamap.shard.scope(async () => {
      for (const slug of SLUGS) daemons[slug].entities.mode.create({ type: "game", slug: "flashcard" });
      await scenario.datamap.entities.em.flush();
    });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.it("italian hears /after/literal/create for its own row and nothing for spanish's", async () => {
    await scenario.datamap.shard.scope(async () => {
      const mode = await daemons.italian.entities.mode.findOneOrFail({ slug: "flashcard" });
      daemons.italian.entities.literal.create({ slug: "casa", mode });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.italian).toEqual(["italian:casa"]);
    specimen.expect(heard.spanish).toEqual([]);
  });

  specimen.it("spanish hears its own casa, italian hears nothing more — the kind's name, never a daemon's", async () => {
    await scenario.datamap.shard.scope(async () => {
      const mode = await daemons.spanish.entities.mode.findOneOrFail({ slug: "flashcard" });
      daemons.spanish.entities.literal.create({ slug: "casa", mode });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.spanish).toEqual(["spanish:casa"]);
    specimen.expect(heard.italian).toEqual(["italian:casa"]);
  });

  specimen.it("the runtime root hears every daemon's row", () => {
    specimen.expect(kernel).toEqual(["casa", "casa"]);
  });

  specimen.it("a kind with no daemon column passes whole — every daemon hears /after/thread/create", async () => {
    const threads = Object.fromEntries(SLUGS.map((slug) => [slug, 0]));
    for (const slug of SLUGS) daemons[slug].twitch.open("/after/thread/create", () => threads[slug]++);
    const finn = await scenario.signup("finn");
    await scenario.connect(finn.access).call("/userspace/entities/thread/create", { data: {} });
    await sleep.ms(20);
    specimen.expect(threads).toEqual({ italian: 1, spanish: 1 });
  });
});

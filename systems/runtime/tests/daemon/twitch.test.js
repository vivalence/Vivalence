import { specimen, Aperture, Controller, Path, sleep, Span, Twitch } from "@vivalence/typology";
import { lifecycle } from "@vivalence/runtime";
import { lighthouse } from "../scenarios/index.js";

const SLUGS = ["italian", "spanish"];

specimen.describe("a daemon's twitch — its own Twitch, the daemon bound, a foreign daemon's rows dropped before dispatch", () => {
  let scenario;
  const daemons = {};
  const heard = Object.fromEntries(SLUGS.map((slug) => [slug, []]));
  const kernel = [];
  const booted = [];

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    scenario.runtime.twitch.open("/after/literal/create", (ctx) => kernel.push(ctx.input.entity.slug));
    for (const slug of SLUGS) {
      await scenario.seedDaemon(slug);
      const die = { runtime: scenario.runtime, daemon: { type: "daemon", slug, reference: new Path(`/daemon/${slug}`), domain: { twitch: new Twitch().open("/after/datamap/boot", (ctx) => booted.push(`datamap:${ctx.daemon.slug}`)) }, aperture: new Aperture(), controller: new Controller({ stdout: new Span(slug) }) }, register: { modes: [] } };
      await lifecycle.daemon.population.datamap(die, async () => {});
      die.daemon.twitch.open("/after/literal/create", (ctx) => heard[slug].push(`${ctx.input.entity.daemon.slug}:${ctx.input.entity.slug}`));
      daemons[slug] = die.daemon;
    }
    await scenario.datamap.shard.scope(async () => {
      for (const slug of SLUGS) daemons[slug].entities.mode.create({ type: "game", slug: "flashcard", daemon: slug });
      await scenario.datamap.entities.em.flush();
    });
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.it("italian hears /after/literal/create for its own row and nothing for spanish's", async () => {
    await scenario.datamap.shard.scope(async () => {
      const mode = await daemons.italian.entities.mode.findOneOrFail({ slug: "flashcard", daemon: "italian" });
      daemons.italian.entities.literal.create({ slug: "casa", mode, daemon: "italian" });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.italian).toEqual(["italian:casa"]);
    specimen.expect(heard.spanish).toEqual([]);
  });

  specimen.it("spanish hears its own casa, italian hears nothing more — the kind's name, never a daemon's", async () => {
    await scenario.datamap.shard.scope(async () => {
      const mode = await daemons.spanish.entities.mode.findOneOrFail({ slug: "flashcard", daemon: "spanish" });
      daemons.spanish.entities.literal.create({ slug: "casa", mode, daemon: "spanish" });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.spanish).toEqual(["spanish:casa"]);
    specimen.expect(heard.italian).toEqual(["italian:casa"]);
  });

  specimen.it("a twitch that throws after the write faults on its daemon's stdout, never another's", async () => {
    const fault = new Error("the after-step failed");
    daemons.italian.twitch.open("/after/literal/update", () => {
      throw fault;
    });
    await scenario.datamap.shard.scope(async () => {
      const casa = await daemons.italian.entities.literal.findOneOrFail({ slug: "casa", daemon: "italian" });
      casa.ontology = "word";
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    const faults = (daemon) => daemon.controller.stdout.$history.get().filter((record) => record.track === "fault");
    specimen.expect(faults(daemons.italian).map((record) => record.data.message)).toEqual([fault.message]);
    specimen.expect(faults(daemons.spanish)).toEqual([]);
  });

  specimen.it("a boot signal rides the entity twitch's own wiring: the daemon bound, never awaited, silence is no fault", async () => {
    specimen.expect(booted).toEqual(["datamap:italian", "datamap:spanish"]);
    daemons.italian.twitch.open("/after/daemon/boot", async (ctx) => {
      await sleep.ms(5);
      booted.push(`daemon:${ctx.daemon.slug}`);
    });
    const die = { runtime: scenario.runtime, daemon: daemons.italian };
    let passed = false;
    await lifecycle.daemon.integration.booted(die, async () => void (passed = true));
    specimen.expect(passed).toBe(true);
    specimen.expect(booted).toEqual(["datamap:italian", "datamap:spanish"]);
    await sleep.ms(20);
    specimen.expect(booted).toEqual(["datamap:italian", "datamap:spanish", "daemon:italian"]);
    await lifecycle.daemon.integration.booted({ runtime: scenario.runtime, daemon: daemons.spanish }, async () => {});
    await sleep.ms(20);
    specimen.expect(booted.length).toBe(3);
    const before = [];
    daemons.italian.twitch.open("/before/daemon/boot", () => before.push("inline"));
    await daemons.italian.twitch.dispatch("/before/daemon/boot");
    specimen.expect(before).toEqual(["inline"]);
  });

  specimen.it("the runtime root hears every daemon's row", () => {
    specimen.expect(kernel).toEqual(["casa", "casa"]);
  });

  specimen.it("a kind with no daemon column passes whole — every daemon hears /after/thread/create", async () => {
    const threads = Object.fromEntries(SLUGS.map((slug) => [slug, 0]));
    for (const slug of SLUGS) daemons[slug].twitch.open("/after/thread/create", () => threads[slug]++);
    const finn = await scenario.signup("finn");
    await scenario.connect(finn.access).call("/userspace/entities/thread/create", {
      data: { user: finn.user.id },
    });
    await sleep.ms(20);
    specimen.expect(threads).toEqual({ italian: 1, spanish: 1 });
  });
});

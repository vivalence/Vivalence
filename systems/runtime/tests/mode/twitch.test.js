import { specimen, Aperture, contexts, Controller, Mode, Path, shard, sleep, Span, Twitch, Vector } from "@vivalence/typology";
import { lifecycle, traits } from "@vivalence/runtime";
import { lighthouse } from "../scenarios/index.js";

const SLUGS = ["italian", "spanish"];
const MODES = ["flashcard", "listen"];

specimen.describe("a mode's twitch — its own subscriber, the mode bound, a foreign daemon's rows dropped", () => {
  let scenario;
  const daemons = {};
  const modes = {};
  const heard = Object.fromEntries(MODES.map((slug) => [slug, []]));

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    for (const slug of SLUGS) {
      await scenario.seedDaemon(slug);
      const die = {
        runtime: scenario.runtime,
        daemon: {
          type: "daemon",
          slug,
          reference: new Path(`/daemon/${slug}`),
          domain: {},
          aperture: new Aperture(),
          controller: new Controller({ stdout: new Span(slug) }),
        },
        register: { modes: [] },
      };
      await lifecycle.daemon.population.datamap(die, async () => {});
      daemons[slug] = die.daemon;
    }
    for (const slug of MODES) {
      const mode = Object.assign(new Mode({ module: { manifest: { type: "game", slug, traits: [] } } }), {
        daemon: "italian",
        stdout: new Span(`mode/game/${slug}`),
      });
      const modeDie = { ...shard.context.lift(contexts.modeDie, daemons.italian), mode, traits: {} };
      await lifecycle.mode.population.core(modeDie, async () => {});
      mode.twitch.open("/after/literal/create", (ctx) => heard[slug].push(`${ctx.mode.manifest.slug}:${ctx.input.entity.slug}`));
      modes[slug] = mode;
    }
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.it("each mode hears its daemon's row under its OWN ctx.mode, never the last one attached", async () => {
    await scenario.datamap.shard.scope(async () => {
      daemons.italian.entities.literal.create({ slug: "casa", mode: modes.flashcard.id, daemon: "italian" });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.flashcard).toEqual(["flashcard:casa"]);
    specimen.expect(heard.listen).toEqual(["listen:casa"]);
  });

  specimen.it("a foreign daemon's row reaches neither mode", async () => {
    await scenario.datamap.shard.scope(async () => {
      const mode = await daemons.spanish.entities.mode.create({ type: "game", slug: "flashcard", daemon: "spanish" });
      daemons.spanish.entities.literal.create({ slug: "perro", mode, daemon: "spanish" });
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    specimen.expect(heard.flashcard).toEqual(["flashcard:casa"]);
    specimen.expect(heard.listen).toEqual(["listen:casa"]);
  });

  specimen.it("a mode's twitch that throws after the write faults on its mode's stdout, never its sibling's", async () => {
    const fault = new Error("the after-step failed");
    modes.flashcard.twitch.open("/after/literal/update", () => {
      throw fault;
    });
    await scenario.datamap.shard.scope(async () => {
      const casa = await daemons.italian.entities.literal.findOneOrFail({ slug: "casa", daemon: "italian" });
      casa.ontology = "word";
      await scenario.datamap.entities.em.flush();
    });
    await sleep.ms(20);
    const faults = (mode) => mode.stdout.$history.get().filter((record) => record.track === "fault");
    specimen.expect(faults(modes.flashcard).map((record) => record.data.message)).toEqual([fault.message]);
    specimen.expect(faults(modes.listen)).toEqual([]);
  });

  specimen.it("TWITCHY grafts the module's twitch onto the mode's: a file recorded in its daemon is heard, the mode bound", async () => {
    const recorded = [];
    modes.listen.module.twitch = new Vector()
      .open("/after/file/create", (ctx) => recorded.push(`create ${ctx.mode.manifest.slug}:${ctx.input.entity.path}`))
      .open("/after/file/update", (ctx) => recorded.push(`update ${ctx.mode.manifest.slug}:${ctx.input.entity.path}`));
    traits.mode.TWITCHY(modes.listen);
    const written = { mode: modes.listen.id, daemon: "italian", path: "source/hello.md", mount: "/nowhere/hello.md", mime: "text/markdown" };
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ ...written, bytes: new TextEncoder().encode("# hello") });
    });
    await sleep.ms(20);
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ ...written, bytes: new TextEncoder().encode("# hello, again") });
    });
    await sleep.ms(20);
    specimen.expect(recorded).toEqual(["create listen:source/hello.md", "update listen:source/hello.md"]);
  });

  specimen.it("a file's twitch reaches every TWITCHY mode of its daemon, a foreign daemon's file none; a route naming its own mode hears only its own", async () => {
    const reached = [];
    const own = [];
    for (const slug of MODES) {
      modes[slug].module.twitch = new Vector().open("/after/file/create", (ctx) => {
        reached.push(`${ctx.mode.manifest.slug}:${ctx.input.entity.path}`);
        if (ctx.input.entity.mode.id === ctx.mode.id) own.push(`${ctx.mode.manifest.slug}:${ctx.input.entity.path}`);
      });
      traits.mode.TWITCHY(modes[slug]);
    }
    const bytes = new TextEncoder().encode("# sibling");
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ mode: modes.flashcard.id, daemon: "italian", path: "source/sibling.md", mount: "/nowhere/sibling.md", mime: "text/markdown", bytes });
      await daemons.spanish.entities.file.record({ daemon: "spanish", path: "source/foreign.md", mount: "/nowhere/foreign.md", mime: "text/markdown", bytes });
    });
    await sleep.ms(20);
    specimen.expect(reached.sort()).toEqual(["flashcard:source/sibling.md", "listen:source/sibling.md"]);
    specimen.expect(own).toEqual(["flashcard:source/sibling.md"]);
  });

  specimen.it("a twitch route calls its mode's own aperture: a recorded source is built once, the page it writes builds nothing", async () => {
    const built = [];
    modes.flashcard.aperture.open("/build", async (input, ctx) => {
      built.push(input.path);
      const page = input.path.replace(/^source\//, "public/").replace(/\.md$/, ".html");
      const bytes = new TextEncoder().encode("<h1>built</h1>");
      return await ctx.entities.file.record({ mode: ctx.mode.id, daemon: "italian", path: page, mount: `/nowhere/${page}`, mime: "text/html", bytes });
    });
    await (await traits.mode.EXPOSED(modes.flashcard))();
    modes.flashcard.module.twitch = new Vector().open("/after/file/create", async (ctx) => {
      if (ctx.input.entity.mode.id !== ctx.mode.id) return;
      if (!ctx.input.entity.path.startsWith("source/")) return;
      await ctx.mode.call.build({ path: ctx.input.entity.path });
    });
    traits.mode.TWITCHY(modes.flashcard);
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ mode: modes.flashcard.id, daemon: "italian", path: "source/built.md", mount: "/nowhere/built.md", mime: "text/markdown", bytes: new TextEncoder().encode("# built") });
    });
    await sleep.ms(60);
    specimen.expect(built).toEqual(["source/built.md"]);
    await scenario.datamap.shard.scope(async () => {
      const page = await daemons.italian.entities.file.findOneOrFail({ path: "public/built.html" });
      specimen.expect(page.mime).toBe("text/html");
      specimen.expect(page.bytes).toBe(14);
    });
  });

  specimen.it("a grafted route that throws after the write faults on its mode's stdout, never its sibling's; the file stays written", async () => {
    const fault = new Error("the build failed");
    const faults = (mode) => mode.stdout.$history.get().filter((record) => record.track === "fault").map((record) => record.data.message);
    const before = { listen: faults(modes.listen), flashcard: faults(modes.flashcard) };
    modes.listen.module.twitch = new Vector().open("/after/file/create", () => {
      throw fault;
    });
    traits.mode.TWITCHY(modes.listen);
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ mode: modes.listen.id, daemon: "italian", path: "source/faulty.md", mount: "/nowhere/faulty.md", mime: "text/markdown", bytes: new TextEncoder().encode("# faulty") });
    });
    await sleep.ms(20);
    specimen.expect(faults(modes.listen)).toEqual([...before.listen, fault.message]);
    specimen.expect(faults(modes.flashcard)).toEqual(before.flashcard);
    await scenario.datamap.shard.scope(async () => {
      specimen.expect(await daemons.italian.entities.file.count({ path: "source/faulty.md" })).toBe(1);
    });
  });

  specimen.it("a module's twitch export is the declaration: population mints each seat a Twitch of its own, TWITCHY grafts the export on", async () => {
    const heard = [];
    const module = {
      manifest: { type: "game", slug: "seated", traits: ["TWITCHY"] },
      twitch: new Vector().open("/after/file/create", (ctx) => heard.push(`${ctx.mode.daemon}:${ctx.input.entity.path}`)),
    };
    const seats = [];
    for (const slug of SLUGS) {
      const mode = Object.assign(new Mode({ module }), { daemon: slug, stdout: new Span(`${slug}/mode/game/seated`) });
      const modeDie = { ...shard.context.lift(contexts.modeDie, daemons[slug]), mode, traits: {} };
      await lifecycle.mode.population.core(modeDie, async () => {});
      traits.mode.TWITCHY(mode);
      seats.push(mode);
    }
    specimen.expect(seats.map((mode) => mode.twitch instanceof Twitch)).toEqual([true, true]);
    specimen.expect(seats.map((mode) => mode.twitch === module.twitch)).toEqual([false, false]);
    specimen.expect(seats[0].twitch === seats[1].twitch).toBe(false);
    const bytes = new TextEncoder().encode("# seat");
    await scenario.datamap.shard.scope(async () => {
      await daemons.italian.entities.file.record({ mode: seats[0].id, daemon: "italian", path: "source/seat.md", mount: "/nowhere/seat.md", mime: "text/markdown", bytes });
    });
    await sleep.ms(20);
    specimen.expect(heard).toEqual(["italian:source/seat.md"]);
  });
});

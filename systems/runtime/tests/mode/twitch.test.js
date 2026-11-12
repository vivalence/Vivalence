import { specimen, Aperture, contexts, Controller, Mode, Path, shard, sleep, Span } from "@vivalence/typology";
import { lifecycle } from "@vivalence/runtime";
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
      const mode = Object.assign(new Mode({ manifest: { type: "game", slug, traits: [] } }), {
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
});

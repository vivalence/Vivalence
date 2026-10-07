import { specimen, traits, v, Aperture, Path, Vector, sleep } from "@vivalence/typology";
import { lifecycle, LiteralEntity, NoteEntity, UserEntity } from "@vivalence/runtime";
import { lighthouse } from "../scenarios/index.js";

const SLUGS = ["italian", "spanish"];

const RETAINED = traits.define("RETAINED", {
  schematic: v.object({ due: v.string() }),
  repository: {
    held(note) {
      return v.literal.trait(note, "RETAINED", this.schematics);
    },
  },
});

const PICKED = traits.define("PICKED", {
  repository: {
    retained(where = {}) {
      return this.find({ ...where, notes: { trait: { RETAINED: { due: { $ne: null } } } } }, { populate: ["notes"] });
    },
  },
});

const stamped = [];
const twitch = new Vector().open("/before/literal/create", (ctx) => stamped.push(`${ctx.input.entity.daemon.slug}:${ctx.input.entity.slug}`));
const domain = { traits: { literal: [PICKED], note: [RETAINED] }, twitch };

specimen.describe("a domain's traits on two daemons — claims, the schematics a verb reads, a note on its literal", { sanitizeResources: false, sanitizeOps: false }, () => {
  let scenario;
  let within;
  const daemons = {};

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
    for (const slug of SLUGS) {
      await scenario.seedDaemon(slug);
      const die = { runtime: scenario.runtime, daemon: { type: "daemon", slug, reference: new Path(`/daemon/${slug}`), domain, aperture: new Aperture() }, register: { modes: [] } };
      await lifecycle.daemon.population.datamap(die, async () => {});
      daemons[slug] = die.daemon;
    }
    await scenario.datamap.shard.scope(async () => {
      within = scenario.datamap.shard.carry();
    });
    await within(async () => {
      const em = scenario.datamap.entities.em;
      const user = em.create(UserEntity, { slug: "beef" });
      await em.flush();
      em.setFilterParams("user", { user: user.id });
      for (const slug of SLUGS) {
        const { entities } = daemons[slug];
        const mode = entities.mode.create({ type: "game", slug: "dojo" });
        const casa = entities.literal.create({ slug: "casa", mode });
        entities.literal.create({ slug: "cane", mode });
        entities.note.create({ user, literal: casa, slug: "retention.casa", traits: ["RETAINED"], trait: { RETAINED: { due: `${slug}-due` } } });
        entities.note.create({ user, slug: "memo", traits: ["LABELED"], trait: { LABELED: { name: "memo" } } });
      }
      await em.flush();
      await sleep.ms(20);
    });
  });

  specimen.afterAll(async () => await scenario.close());

  specimen.it("a traits claim resolves through a daemon's minted repository and stays inside its daemon", () =>
    within(async () => {
      for (const slug of SLUGS) {
        const rows = await daemons[slug].entities.note.find({ traits: "RETAINED" });
        specimen.expect(rows.map((row) => `${row.daemon.slug}:${row.slug}`)).toEqual([`${slug}:retention.casa`]);
      }
    }));

  specimen.it("a trait verb reads its daemon's vocabulary through this.schematics", () =>
    within(async () => {
      const [note] = await daemons.italian.entities.note.find({ traits: "RETAINED" });
      specimen.expect(daemons.italian.entities.note.schematics.RETAINED).toBe(RETAINED.schematic);
      specimen.expect(daemons.italian.entities.note.held(note)).toEqual({ due: "italian-due" });
      specimen.expect(daemons.italian.entities.literal.schematics.RETAINED).toBeUndefined();
    }));

  specimen.it("a note rides its literal: Note.literal m:1 · Literal.notes 1:m, joined from the literal's repository", () =>
    within(async () => {
      const picked = await daemons.spanish.entities.literal.retained();
      specimen.expect(picked.map((row) => row.slug)).toEqual(["casa"]);
      specimen.expect(picked[0].notes.getItems().map((note) => note.trait.RETAINED.due)).toEqual(["spanish-due"]);
      specimen.expect(await scenario.datamap.entities.em.count(NoteEntity, { literal: { slug: "casa" } })).toBe(2);
      specimen.expect(await scenario.datamap.entities.em.count(LiteralEntity, { slug: "casa" })).toBe(2);
    }));

  specimen.it("one domain twitch grafted under both daemons hears each daemon's own rows", () => {
    specimen.expect(stamped.sort()).toEqual(["italian:cane", "italian:casa", "spanish:cane", "spanish:casa"]);
  });
});

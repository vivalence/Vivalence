import { specimen } from "@vivalence/typology";
import { accio } from "../scenarios/registry.js";
import { mountMode } from "../scenarios/mode.js";


const emitted = (result) => result?.output?.buffer ?? [];

const inputs = {
  exhibit: {
    present: (fixtures) => ({
      layout: "table",
      title: "Test",
      literals: [fixtures.hello, fixtures.goodbye],
    }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  match: {
    batch: (fixtures) => ({
      literals: [fixtures.hello, fixtures.goodbye, fixtures.thanks],
      recall: "LEARNING",
    }),
    feed: (fixtures) => ({ limit: 3 }),
  },
  judge: {
    literal: (fixtures) => ({ literal: fixtures.hello, recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 2 }),
  },
};

// resolved at module scope, not in beforeAll — the describe body branches on viva.manifest
// at collection time, before any hook has run.
const domain = await accio("@education/domain/language-learning");
const modes = Object.fromEntries(
  await Promise.all(
    ["exhibit", "match", "judge"].map(async (slug) => [slug, await accio(`@education/game/${slug}`)]),
  ),
);

for (const [slug, viva] of Object.entries(modes)) {
  specimen.describe(`game/${slug}`, () => {
    let scenario;

    specimen.beforeAll(async () => {
      scenario = await mountMode(viva, { entities: domain.entities });
    });

    specimen.afterAll(async () => {
      await scenario?.orm?.close();
    });

    specimen.it("mode wired with emit object", () => {
      specimen.expect(scenario.mode.emit).toBeTruthy();
      const routeNames = Object.keys(scenario.mode.emit);
      specimen.expect(routeNames.length).toBeGreaterThan(0);
    });

    for (const [route, inputFn] of Object.entries(inputs[slug])) {
      specimen.it(`emit.${route} returns buffer(s)`, async () => {
        await scenario.scoped(async () => {
          const result = await scenario.mode.emit[route](inputFn(scenario.fixtures));
          specimen.expect(result.condition).toBeTruthy();
          for (const buffer of emitted(result)) {
            specimen.expect(buffer.data).toBeTruthy();
          }
        });
      });
    }

    if (viva.dataset?.intent && viva.manifest.traits.includes("INTENTED")) {
      specimen.it("intents seeded", async () => {
        for (const intent of viva.dataset.intent) {
          const found = await scenario.daemon.entities.intent.findOne({ slug: intent.slug });
          specimen.expect(found).toBeTruthy();
        }
      });
    }
  });
}

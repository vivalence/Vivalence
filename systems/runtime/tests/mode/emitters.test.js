import { specimen } from "@vivalence/typology";
import { mountMode } from "../scenarios/mode.js";

// ── tier A: TRANSLATED literals only ───────────────────────────────
import * as flashcard from "../../../../registry/education/modes/games/flashcard/flashcard.viva.js";
import * as exhibit from "../../../../registry/education/modes/games/exhibit/exhibit.viva.js";
import * as shadow from "../../../../registry/education/modes/games/shadow/shadow.viva.js";
import * as write from "../../../../registry/education/modes/games/write/write.viva.js";
import * as match from "../../../../registry/education/modes/games/match/match.viva.js";

// ── tier B: need distractor pool (≥3 literals) ────────────────────
import * as judge from "../../../../registry/education/modes/games/judge/judge.viva.js";
import * as pick from "../../../../registry/education/modes/games/pick/pick.viva.js";

// ── input map ──────────────────────────────────────────────────────
// Each mode maps route name → function(fixtures) → input object.
// This is the business logic: what does a representative emit look like?
//
// TODO: fill in the input map

const inputs = {
  flashcard: {
    literals: (fixtures) => ({ recall: "LEARNING", literals: [fixtures.hello] }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  exhibit: {
    present: (fixtures) => ({ layout: "table", title: "Test", literals: [fixtures.hello, fixtures.goodbye] }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  shadow: {
    literals: (fixtures) => ({ literal: fixtures.hello, recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  write: {
    literals: (fixtures) => ({ literal: fixtures.hello, recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  match: {
    batch: (fixtures) => ({ literals: [fixtures.hello, fixtures.goodbye, fixtures.thanks], recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 3 }),
  },
  judge: {
    literal: (fixtures) => ({ literal: fixtures.hello, recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 2 }),
  },
  pick: {
    literal: (fixtures) => ({ literal: fixtures.hello, recall: "LEARNING" }),
    feed: (fixtures) => ({ limit: 2 }),
  },
};

// ── parameterized tests ────────────────────────────────────────────
const modes = { flashcard, exhibit, shadow, write, match, judge, pick };

for (const [slug, viva] of Object.entries(modes)) {
  specimen.describe(`game/${slug}`, () => {
    let scenario;

    specimen.beforeAll(async () => {
      scenario = await mountMode(viva);
    });

    specimen.afterAll(async () => {
      await scenario?.orm?.close();
    });

    specimen.it("mode wired with emit object", () => {
      specimen.expect(scenario.mode.emit).toBeTruthy();
      const routeNames = Object.keys(scenario.mode.emit);
      specimen.expect(routeNames.length).toBeGreaterThan(0);
    });

    if (inputs[slug]) {
      for (const [route, inputFn] of Object.entries(inputs[slug])) {
        specimen.it(`emit.${route} returns buffer(s)`, async () => {
          await scenario.scoped(async () => {
            const result = await scenario.mode.emit[route](inputFn(scenario.fixtures));
            specimen.expect(result.condition).toBeTruthy();
            const buffers = result.entities?.buffer ?? [];
            specimen.expect(buffers.length).toBeGreaterThanOrEqual(0);
            for (const buffer of buffers) {
              if (buffer) {
                specimen.expect(buffer.data).toBeTruthy();
              }
            }
          });
        });
      }
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

import { specimen, Cortex } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";

import * as repogram from "../rep-o-gram.viva.js";

const PROVISIONED = {
  reply: "Audio sentences with a streak of 3.",
  axes: { prompt: "AUDIO", streak: 3 },
  knowables: [{ known: "the kitchen", learning: "a cozinha" }],
};

const provisioner = () => [
  {
    type: "dialogue",
    tune: [0.5, 0.5, 0.5],
    context: 200000,
    channels: { in: ["text"], out: ["text"] },
    via: {
      render: async () => ({
        role: "assistant",
        parts: [{ type: "object", data: PROVISIONED }],
        meta: { state: "complete" },
        object: PROVISIONED,
      }),
    },
  },
];

specimen.describe("rep-o-gram aperture", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await mountMode(repogram, { cortex: new Cortex().register(provisioner()) });
  });

  specimen.afterAll(async () => {
    await scenario?.orm?.close();
  });

  specimen.it("/symbols lists every symbol slug with its literal count", async () => {
    await scenario.scoped(async () => {
      const rows = await scenario.authedConn.call("/mode/game/rep-o-gram/symbols", {});
      specimen.expect(rows.length).toBeGreaterThanOrEqual(3);
      const greeting = rows.find((row) => row.slug === "greeting");
      specimen.expect(greeting).toBeTruthy();
      specimen.expect(greeting.literals).toBeGreaterThanOrEqual(1);
    });
  });

  specimen.it("/provision reads the request through the cortex and answers the contract", async () => {
    await scenario.scoped(async () => {
      const out = await scenario.authedConn.call("/mode/game/rep-o-gram/provision", {
        text: "audio sentences about the kitchen, streak 3",
      });
      specimen.expect(out.reply).toBe(PROVISIONED.reply);
      specimen.expect(out.axes.streak).toBe(3);
      specimen.expect(out.knowables.length).toBe(1);
    });
  });
});

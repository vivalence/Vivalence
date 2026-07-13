import { Vector } from "@vivalence/typology";
import * as hal from "./hal/index.js";
import { TURN_INPUT, TURN_OUTPUT } from "./types.js";
import { frontierOf, masteredSlugs } from "./frontier.js";

export const aperture = new Vector().open(
  { nature: "/assistant/turn", input: TURN_INPUT, output: TURN_OUTPUT },
  async (ctx) => {
    const buffer = await ctx.daemon.entities.buffer.findOne(ctx.input.buffer);
    const concepts = await ctx.daemon.entities.literal.find(
      { slug: { $like: "reading.%" } },
      { populate: ["memories"] },
    );
    const conceptBySlug = new Map(concepts.map((concept) => [concept.slug, concept]));

    const answered = Number.isInteger(ctx.input.choice) && buffer.data.scene;
    const chosen = answered ? buffer.data.scene.choices?.[ctx.input.choice] : null;

    if (chosen?.correct) {
      const current = conceptBySlug.get(buffer.data.concept);
      if (current) await current.review({ enum: "SUCCESS" }, ctx);
    }

    const mastered = masteredSlugs(concepts);
    const frontier = frontierOf(concepts, mastered);
    const progress = { mastered: mastered.size, total: concepts.length };

    if (!frontier.length) {
      buffer.data = { ...buffer.data, progress };
      await ctx.daemon.entities.em.flush();
      return { progress, done: true };
    }

    const target = frontier[0];
    const userText = [
      hal.narrator.concept(target.trait.LABELED),
      hal.narrator.tale(buffer.data.history),
      chosen ? `The hero chose: "${chosen.label}". Continue the tale from that choice.` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const turns = [
      ...buffer.data.history,
      { role: "user", parts: [{ type: "text", text: userText }] },
    ];

    const render = await ctx.mode.harness.object.render({
      turns,
      output: hal.narrator.output,
      thread: ctx.input.thread,
    });

    const scene = render.object;

    buffer.data = {
      ...buffer.data,
      concept: target.slug,
      scene,
      progress,
      history: [...turns, { role: "assistant", parts: [{ type: "text", text: scene.prose }] }],
    };
    await ctx.daemon.entities.em.flush();

    return {
      concept: { slug: target.slug, name: target.trait.LABELED.name },
      scene: {
        prose: scene.prose,
        question: scene.question,
        choices: scene.choices.map((choice) => ({ label: choice.label })),
      },
      progress,
      done: false,
    };
  },
);

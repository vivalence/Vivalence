import { Vector } from "@vivalence/typology";
import * as hal from "./hal/index.js";
import { ASSISTANT_MESSAGE_INPUT, ASSISTANT_EVALUATE_INPUT } from "./types.js";

export const aperture = new Vector().open(
  {
    nature: "/assistant/message",
    input: ASSISTANT_MESSAGE_INPUT,
  },
  async (ctx) => {
    console.log("assistant/message {input}", { input: ctx.input });
    const buffer = await ctx.daemon.entities.buffer.findOne(ctx.input.buffer, {
      populate: ["literals"],
    });
    console.log("assistant/message {buffer}", { buffer });

    buffer.data.history = [
      ...buffer.data.history,
      { role: "user", parts: [{ type: "text", text: ctx.input.message }] },
    ];

    const { output } = await ctx.daemon.cortex.hallucinate.object.render({
      policy: { tune: "eager" },
      turns: buffer.data.history,
      output: { schema: hal.assistant.output },
    });

    buffer.data.history = [
      ...buffer.data.history,
      { role: "assistant", parts: [{ type: "text", text: output.object.message }] },
    ];

    if (output.object.resolved && buffer.status !== "DONE") {
      buffer.status = "DONE";
      // ctx.mode.call("/assistant/evaluate", { buffer }); // @beef todo
    }

    await ctx.daemon.entities.em.flush();

    return {
      message: output.object.message,
      taunt: output.object.taunt,
      hint: output.object.hint,
      resolvable: output.object.resolvable,
      resolved: output.object.resolved,
    };
  },
  // )
  // .open(
  //   {
  //     nature: "/assistant/evaluate",
  //     input: ASSISTANT_EVALUATE_INPUT,
  //   },
  //   async (ctx) => {
  //     console.log("assistant/evaluate {input}", { input: ctx.input });
  //     const buffer = ctx.input.buffer;
  //     // const buffer = await ctx.daemon.entities.buffer.findOne(ctx.input.buffer?.id ?? ctx.input.buffer, {populate: ["literals"],},);
  //     console.log("assistant/evaluate {buffer}", { buffer });

  //     const language = ctx.daemon.statics.language;
  //     const literals = buffer.literals?.getItems?.() ?? buffer.literals ?? [];
  //     const dialogue = buffer.data.history.filter((turn) => turn.role !== "system");

  //     const { output } = await ctx.daemon.cortex
  //       .hallucination({ tune: "balanced" })
  //       .context.extend("dialogue", buffer.data.history)
  //       .output.schema(hal.evaluation.output)
  //       .entities.turn.append(
  //         {
  //           role: "system",
  //           parts: [
  //             {
  //               type: "text",
  //               text: hal.evaluation.judge(language, {
  //                 riddle: buffer.data.riddle,
  //                 answer: buffer.data.answer,
  //                 literals,
  //               }),
  //             },
  //           ],
  //         },
  //         dialogue,
  //       )
  //       .object.render();

  //     const bySlug = new Map(literals.map((literal) => [literal.slug, literal.id]));
  //     await Promise.all(
  //       (object.grades ?? [])
  //         .map((grade) => ({ id: bySlug.get(grade.slug), signal: grade.grade }))
  //         .filter((entry) => entry.id)
  //         .map((entry) =>
  //           ctx.daemon.call("/review/literal", { literal: entry.id, signal: entry.signal }),
  //         ),
  //     );

  //     return { resolved: true };
  //   },
);

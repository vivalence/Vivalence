import { specimen, Vector } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";

let scenario;
let captured;

specimen.describe("harness — the thread section", () => {
  specimen.beforeAll(async () => {
    const harness = new Vector().use(async (ctx, next) => {
      ctx.hallucination.system.dewey = "You are Dewey.";
      await next();
      captured = ctx.hallucination;
    });
    scenario = await create({ harness });
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("harness.choice.render reaches the cortex with the caller's primer and questions", async () => {
    const { dewey } = scenario;
    const verdict = await dewey.harness.choice.render({
      primer: { expected: "sono andato", answer: "ho andato" },
      questions: { same: { ask: "Does `answer` mean `expected`?", options: { yes: null, no: null } } },
    });
    specimen.expect(verdict).toEqual({ same: { yes: 0.9, no: 0.1 } });
  });

  specimen.it("names the thread, the mode and every buffer on it, after the mode's own sections", async () => {
    const { daemon, dewey, em, fixtures, createThread } = scenario;
    const thread = await createThread();
    const first = await daemon.entities.buffer.create({ mode: fixtures.dewey, thread: thread.id });
    const second = await daemon.entities.buffer.create({
      mode: fixtures.dewey,
      thread: thread.id,
      data: { open: "22.04.re24-05277.pdf" },
    });
    await em.flush();

    await dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "what is on this thread?" }] });

    specimen.expect(Object.keys(captured.system)).toEqual(["dewey", "thread"]);
    const rows = captured.system.thread.split("\n");
    specimen.expect(rows[0]).toBe(
      `[Thread ${thread.id}] · unlabeled · phase manual · buffers minted 2 · traits none · user ${fixtures.user.id}`,
    );
    specimen.expect(rows[1]).toBe("[Mode teacher/dewey] dewey · traits EXPOSED HARNESSED");
    specimen.expect(rows[2]).toContain("[Buffers on this thread] · 2 · rows:");
    specimen.expect(rows[2]).toContain(`where: { thread: "${thread.id}" }`);
    specimen.expect(rows[3]).toBe(`0 · ${first.id} · dewey #0 · teacher/dewey · PENDING · {}`);
    specimen.expect(rows[4]).toBe(`1 · ${second.id} · dewey #1 · teacher/dewey · PENDING · {"open":"22.04.re24-05277.pdf"}`);
    specimen.expect(captured.policy.cache).toEqual({ marks: ["dewey", "tools"] });
    specimen.expect(captured.controller.stdout.absolute).toBe("/hallucination");
  });
});

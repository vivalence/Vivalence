import { specimen, v } from "@vivalence/typology";

const { Usage, Measure, Limit } = v.primitives.track;
const { Meta } = v.primitives.hallucination;

const faults = (schema, value) => [...v.faults(schema, value)];

const dialogue = {
  subject: { faculty: "dialogue", provider: "openrouter", id: "openai/gpt-5.1", via: "stream", round: 2 },
  state: "complete",
  measures: [
    { name: "elapsed", unit: "ms", amount: 513.58, by: "cortex" },
    { name: "first", unit: "ms", amount: 275.32, by: "cortex" },
    { name: "output", unit: "chars", amount: 71, channel: "text", by: "cortex" },
    { name: "input", unit: "tokens", amount: 6871, by: "openrouter" },
    { name: "output", unit: "tokens", amount: 139, by: "openrouter" },
    { name: "cost", unit: "usd", amount: 0.009755, by: "openrouter" },
  ],
  limits: [{ name: "input", unit: "tokens", quota: 450000, window: 60, remaining: 443129, reset: 12, by: "openrouter" }],
};

const request = {
  subject: { route: "/userspace/entities/thread/find", method: "POST" },
  state: "200",
  measures: [
    { name: "elapsed", unit: "ms", amount: 12.4 },
    { name: "output", unit: "bytes", amount: 2048 },
  ],
};

specimen.describe("Usage — what a subject used, as measures", () => {
  specimen.it("one record holds a provider call and a plain server request alike", () => {
    specimen.expect(faults(Usage, dialogue)).toEqual([]);
    specimen.expect(faults(Usage, request)).toEqual([]);
  });

  specimen.it("a running record carries no state and no limits", () => {
    specimen.expect(faults(Usage, { subject: dialogue.subject, measures: [] })).toEqual([]);
  });

  specimen.it("a measure names what, in what unit, how much: each is required", () => {
    specimen.expect(faults(Measure, { name: "output", unit: "tokens", amount: 139 })).toEqual([]);
    specimen.expect(faults(Measure, { unit: "tokens", amount: 139 }).length).toBeGreaterThan(0);
    specimen.expect(faults(Measure, { name: "output", amount: 139 }).length).toBeGreaterThan(0);
    specimen.expect(faults(Measure, { name: "output", unit: "tokens" }).length).toBeGreaterThan(0);
  });

  specimen.it("the keys that were ruled out are refused: flow on a measure, timings on the record", () => {
    specimen.expect(faults(Measure, { name: "output", unit: "tokens", amount: 1, flow: "out" }).length).toBeGreaterThan(0);
    specimen.expect(faults(Usage, { ...request, elapsed: 12.4 }).length).toBeGreaterThan(0);
    specimen.expect(faults(Usage, { ...request, first: 3 }).length).toBeGreaterThan(0);
  });

  specimen.it("a limit names the measure it bounds and needs its quota", () => {
    specimen.expect(faults(Limit, dialogue.limits[0])).toEqual([]);
    specimen.expect(faults(Limit, { name: "input", unit: "tokens" }).length).toBeGreaterThan(0);
  });
});

specimen.describe("Meta — a turn's usage is measures, every stored form heals on decode", () => {
  const tokens = (input, output) => [
    { name: "input", unit: "tokens", amount: input },
    { name: "output", unit: "tokens", amount: output },
  ];

  specimen.it("the receipt we stored before heals, and the provider's raw count beside it is kept", () => {
    const raw = { prompt_tokens: 6871, completion_tokens: 139, cost: 0.009755 };
    const stored = { state: "complete", usage: { input: 6871, output: 139, cost: 0.009755 }, provider: { usage: raw } };
    specimen.expect(Meta.decode(stored)).toEqual({
      state: "complete",
      usage: [...tokens(6871, 139), { name: "cost", unit: "usd", amount: 0.009755 }],
      provider: { usage: raw },
    });
  });

  specimen.it("a provider's own dialect heals, its raw count moves under provider", () => {
    const openrouter = { prompt_tokens: 11, completion_tokens: 29 };
    const anthropic = { input_tokens: 120, output_tokens: 40 };
    specimen.expect(Meta.decode({ usage: openrouter })).toEqual({ usage: tokens(11, 29), provider: { usage: openrouter } });
    specimen.expect(Meta.decode({ usage: anthropic })).toEqual({ usage: tokens(120, 40), provider: { usage: anthropic } });
  });

  specimen.it("measures pass untouched, a meta without usage too", () => {
    specimen.expect(Meta.decode({ usage: tokens(1, 2) })).toEqual({ usage: tokens(1, 2) });
    specimen.expect(Meta.decode({ state: "abort" })).toEqual({ state: "abort" });
  });

  specimen.it("source is not mutated", () => {
    const stored = { usage: { input: 10, output: 20 } };
    Meta.decode(stored);
    specimen.expect(stored).toEqual({ usage: { input: 10, output: 20 } });
  });
});

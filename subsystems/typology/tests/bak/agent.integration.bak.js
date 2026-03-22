import { specimen } from "@vivalence/typology";
import { Action, Agent } from "@vivalence/typology";
import { Type } from "@sinclair/typebox";
import { Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

await paladin.ikiro;
await paladin.vip.mount(paladin.scope.registry.branch("services"));

async function createBrain() {
  const hal = await paladin.vip.accio("@vivalence/hallucinator/hal257");

  const provider = await hal.provider({
    secrets: { anthropic: paladin.secret.get("ANTHROPIC_API_KEY") },
  });
  return provider;
}

specimen.describe("Agent Integration", () => {
  let brain;

  specimen.describe("setup", () => {
    specimen.it("creates brain from hallucinator", async () => {
      brain = await createBrain();
      specimen.expect(brain).toBeDefined();
      specimen.expect(typeof brain.object).toBe("function");
      specimen.expect(typeof brain.action).toBe("function");
    });
  });

  // specimen.describe("generate", () => {
  //   specimen.it("generates structured output", async () => {
  //     const agent = new Agent("classifier")
  //       .withBrain(brain)
  //       .withInput(
  //         Type.Object({
  //           text: Type.String({ description: "Text to classify" }),
  //         }),
  //       )
  //       .withOutput(
  //         Type.Object({
  //           sentiment: Type.String({
  //             description: "positive, negative, or neutral",
  //           }),
  //           confidence: Type.Number({ description: "0-1 confidence score" }),
  //         }),
  //       )
  //       .withContext(
  //         "role",
  //         "You are a sentiment classifier. Analyze the given text.",
  //       )
  //       .withTemplate((input) => `Classify this text: "${input.text}"`);
  //     const result = await agent.generate({ text: "I love this product!" });
  //     console.log("[generate result]", result);
  //     specimen.expect(result).toBeDefined();
  //     specimen.expect(result.sentiment).toBeDefined();
  //     specimen.expect(result.confidence).toBeDefined();
  //   });
  // });

  specimen.describe("do (with tools)", () => {
    specimen.it("executes tools through agent.do", async () => {
      const executionLog = [];

      const vector = new Vector().withSignature(Action);

      vector
        .branch({ nature: "math", valence: "Mathematical operations" })
        .open(
          {
            nature: "add",
            valence: "Add two numbers together",
            input: Type.Object({
              a: Type.Number({ description: "First number" }),
              b: Type.Number({ description: "Second number" }),
            }),
          },
          (ctx) => {
            const result = ctx.input.a + ctx.input.b;
            executionLog.push({ tool: "add", input: ctx.input, result });
            return { result };
          },
        )
        .open(
          {
            nature: "multiply",
            valence: "Multiply two numbers",
            input: Type.Object({
              a: Type.Number({ description: "First number" }),
              b: Type.Number({ description: "Second number" }),
            }),
          },
          (ctx) => {
            const result = ctx.input.a * ctx.input.b;
            executionLog.push({ tool: "multiply", input: ctx.input, result });
            return { result };
          },
        );

      const agent = new Agent("calculator")
        .withBrain(brain)
        .withTools(vector)
        .withInput(Type.Object({ question: Type.String() }))
        .withContext(
          "role",
          "You are a calculator assistant. Use the math tools to answer questions.",
        )
        .withTemplate((input) => input.question);

      console.log(JSON.stringify({ vector, agent }, null, 2));
      const result = await agent.do({ question: "What is 15 + 27?" });

      console.log("[do result]", result);
      console.log("[execution log]", executionLog);

      specimen.expect(result.text).toBeDefined();
      specimen.expect(executionLog.length).toBeGreaterThan(0);

      const addCall = executionLog.find((e) => e.tool === "add");
      specimen.expect(addCall).toBeDefined();
      specimen.expect(addCall.result).toBe(42);
    });

    //     specimen.it("handles multi-step tool execution", async () => {
    //       const executionLog = [];

    //       const vector = new Vector().withSignature(Action);

    //       vector.open(
    //         {
    //           nature: "lookup",
    //           valence: "Look up a value by key",
    //           input: Type.Object({
    //             key: Type.String({ description: "The key to look up" }),
    //           }),
    //         },
    //         (ctx) => {
    //           const data = { price: 100, quantity: 5, discount: 0.1 };
    //           const value = data[ctx.input.key] ?? null;
    //           executionLog.push({ tool: "lookup", key: ctx.input.key, value });
    //           return { value };
    //         },
    //       );

    //       vector.open(
    //         {
    //           nature: "calculate",
    //           valence: "Calculate total from price, quantity, and discount",
    //           input: Type.Object({
    //             price: Type.Number(),
    //             quantity: Type.Number(),
    //             discount: Type.Number(),
    //           }),
    //         },
    //         (ctx) => {
    //           const { price, quantity, discount } = ctx.input;
    //           const total = price * quantity * (1 - discount);
    //           executionLog.push({ tool: "calculate", input: ctx.input, total });
    //           return { total };
    //         },
    //       );

    //       const agent = new Agent("order-calculator")
    //         .withBrain(brain)
    //         .withTools(vector)
    //         .withInput(Type.Object({ task: Type.String() }))
    //         .withContext(
    //           "role",
    //           "You help calculate order totals. First lookup values, then calculate.",
    //         )
    //         .withTemplate((input) => input.task);

    //       const result = await agent.do({
    //         task: "Calculate the total order value using the stored price, quantity, and discount.",
    //       });

    //       console.log("[multi-step result]", result);
    //       console.log("[execution log]", executionLog);

    //       specimen.expect(executionLog.length).toBeGreaterThan(1);
    //     });
  });
});

import { v } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { Vector } from "@vivalence/typology";
import { Agent, specimen, Action } from "@vivalence/typology";

await paladin.ikiro;
await paladin.vip.mount(paladin.scope.registry.branch("services"));

async function createBrain() {
  const hal = await paladin.vip.accio("@vivalence/hallucinator/hal257");
  const provider = await hal.provider({
    secrets: { anthropic: paladin.secret.get("ANTHROPIC_API_KEY") },
  });
  return provider;
}

specimen.describe("Hal Object Generation", () => {
  let brain;
  specimen.describe("setup", () => {
    specimen.it("creates provider instance", async () => {
      brain = await createBrain();
      specimen.expect(brain).toBeDefined();
      specimen.expect(typeof brain.object).toBe("function");
    });
  });
  specimen.describe("object generation", () => {
    specimen.it("generates simple object", async () => {
      const schema = v.object({
        message: v.string({ description: "A greeting message" }),
        timestamp: v.number({ description: "Unix timestamp" }),
      });

      const result = await brain.object({
        schema,
        system: "You are a helpful assistant that generates greetings.",
        prompt: "Generate a greeting with current timestamp",
      });

      specimen.expect(result).toBeDefined();
      specimen.expect(result.object).toBeDefined();
      specimen.expect(typeof result.object.message).toBe("string");
      specimen.expect(typeof result.object.timestamp).toBe("number");
    });
  });
});

specimen.describe("Hal Action with Agent", () => {
  specimen.it("agent executes math workflow with tools", async () => {
    const brain = await createBrain();
    const results = [];

    const mathTools = new Vector().withSignature(Action);

    mathTools
      .open(
        {
          nature: "add",

          valence: "Add two numbers together",
          input: v.object({
            a: v.number({ description: "First number" }),
            b: v.number({ description: "Second number" }),
          }),
        },
        (ctx) => {
          const sum = ctx.input.a + ctx.input.b;
          results.push({ tool: "add", inputs: ctx.input, result: sum });
          return { result: sum };
        },
      )
      .open(
        {
          nature: "multiply",
          valence: "Multiply two numbers together",
          input: v.object({
            a: v.number({ description: "First number" }),
            b: v.number({ description: "Second number" }),
          }),
        },
        (ctx) => {
          const product = ctx.input.a * ctx.input.b;
          results.push({
            tool: "multiply",
            inputs: ctx.input,
            result: product,
          });
          return { result: product };
        },
      );

    const agent = new Agent("calculator")
      .withBrain(brain)
      .withTools(mathTools)
      .withInput(v.object({ problem: v.string() }))
      .withContext("role", "Math assistant. Use tools to solve step by step.")
      .withTemplate((input) => `Solve: ${input.problem}`);

    const output = await agent.do({
      problem: "First add 15 and 27, then multiply the result by 3",
    });

    specimen.expect(output.text).toBeDefined();

    specimen.expect(results.length).toBe(2);
    specimen.expect(results[0].tool).toBe("add");
    specimen.expect(results[1].tool).toBe("multiply");
  });
});

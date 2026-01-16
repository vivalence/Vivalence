import { specimen, is } from "@vivalence/typology";
import { Action, Agent } from "@vivalence/typology";
import { Type } from "@sinclair/typebox";
import { Vector } from "@vivalence/vector";

const mockBrain = {
  object: async ({ schema, system, prompt }) => {
    console.log("[mockBrain.object] called with:", {
      schemaKeys: Object.keys(schema?.properties || {}),
      systemLength: system?.length,
      promptPreview: prompt?.slice(0, 50),
    });
    return {
      object: { result: "mocked", prompt, system },
    };
  },
  action: async ({ tools, system, prompt }) => {
    console.log("[mockBrain.action] called");
    return { text: "mocked action", messages: [] };
  },
};

specimen.describe("Agent", () => {
  specimen.describe("construction", () => {
    specimen.it("creates with slug and configures fluently", () => {
      const agent = new Agent("test-agent");

      specimen.expect(agent.slug).toBe("test-agent");
      specimen.expect(agent.context).toBeInstanceOf(Map);

      const result = agent.withBrain(mockBrain);

      specimen.expect(result).toBe(agent);
      specimen.expect(agent.brain).toBe(mockBrain);
    });
  });
  specimen.describe("context", () => {
    specimen.it("accumulates context and builds system prompt", () => {
      const agent = new Agent("ctx-test")
        .withContext("greeting", "You are helpful.")
        .withContext("style", "Be concise.")
        .withContext("dynamic", (a) => `Agent: ${a.slug}`);

      const system = agent.system;
      specimen.expect(system).toContain("You are helpful.");
      specimen.expect(system).toContain("Be concise.");
      specimen.expect(system).toContain("Agent: ctx-test");
    });
  });
  specimen.describe("generate", () => {
    specimen.it("generates with input and output validation", async () => {
      const inputSchema = Type.Object({
        message: Type.String(),
      });

      const outputSchema = Type.Object({
        evaluation: Type.String(),
      });

      const generatingBrain = {
        object: async ({ schema, system, prompt }) => {
          return {
            object: { evaluation: "test evaluation result" },
          };
        },
      };

      const agent = new Agent("generator")
        .withBrain(generatingBrain)
        .withInput(inputSchema)
        .withOutput(outputSchema)
        .withContext("role", "You are an evaluator.");

      const input = { message: "Hello world" };
      const result = await agent.generate(input);

      specimen.expect(result).toBeDefined();
      specimen.expect(result.evaluation).toBe("test evaluation result");
    });
  });

  specimen.describe("tools", () => {
    specimen.it("extracts and executes tools from vector", async () => {
      const vector = new Vector().withSignature(Action);

      vector
        .open({ nature: "greet", valence: "Greets a user" }, (ctx) => {
          console.log("[tool:greet] called with:", ctx.input);
          return { message: `Hello, ${ctx.input.name}!` };
        })
        .open("another/test", () => ({}));

      const agent = new Agent("tool-test").withTools(vector);

      const greetTool = agent.tools.tools.greet;

      specimen.expect(greetTool.valence).toBe("Greets a user");

      const result = await greetTool.execute({ name: "World" });

      specimen.expect(result.message).toBe("Hello, World!");
    });
  });
});

// OUTDATED. WRONG:
// import { specimen } from "@vivalence/typology";
// import { Agent } from "../agent.js";
// import { Type } from "@sinclair/typebox";

// // Mock brain for testing
// const mockBrain = {
//   object: async ({ schema, system, prompt }) => ({
//     object: { result: "mocked object", prompt, system },
//     usage: { tokens: 100 },
//   }),

//   action: async ({ tools, system, prompt }) => ({
//     text: "mocked action response",
//     toolCalls: [],
//     toolResults: [],
//     messages: [],
//     usage: { tokens: 150 },
//   }),

//   text: async ({ system, prompt }) => ({
//     text: "mocked text response",
//     usage: { tokens: 50 },
//   }),
// };

// specimen.describe("Agent", () => {
//   specimen.describe("construction", () => {
//     specimen.it("creates with slug and name", () => {
//       const agent = new Agent("test-agent", "Test Agent");

//       specimen.expect(agent.slug).toBe("test-agent");
//       specimen.expect(agent.name).toBe("Test Agent");
//     });

//     specimen.it("defaults name to slug", () => {
//       const agent = new Agent("my-agent");
//       specimen.expect(agent.name).toBe("my-agent");
//     });
//   });

//   specimen.describe("configuration", () => {
//     specimen.it("fluent with() method", () => {
//       const agent = new Agent("test")
//         .with("brain", mockBrain)
//         .with("output", Type.Object({ result: Type.String() }));

//       specimen.expect(agent.brain).toBe(mockBrain);
//       specimen.expect(agent._output).toBeDefined();
//     });

//     specimen.it("context accumulates", () => {
//       const agent = new Agent("test")
//         .context("You are helpful.")
//         .context("Be concise.")
//         .context((a) => `Agent: ${a.slug}`);

//       specimen.expect(agent.system).toContain("You are helpful.");
//       specimen.expect(agent.system).toContain("Be concise.");
//       specimen.expect(agent.system).toContain("Agent: test");
//     });
//   });

//   specimen.describe("generate", () => {
//     specimen.it("requires brain and output", async () => {
//       const agent = new Agent("test");

//       await specimen
//         .expect(async () => await agent.generate("test"))
//         .toThrow("missing: brain");
//     });

//     specimen.it("generates structured output", async () => {
//       const agent = new Agent("test")
//         .with("brain", mockBrain)
//         .with("output", Type.Object({ result: Type.String() }))
//         .context("You are a test agent.");

//       const result = await agent.generate("Hello");

//       specimen.expect(result).toBeDefined();
//       specimen.expect(result.result).toBe("mocked object");
//     });

//     specimen.it("uses template for prompt", async () => {
//       const agent = new Agent("test")
//         .with("brain", mockBrain)
//         .with("output", Type.Object({ result: Type.String() }))
//         .with("template", (input) => `Processed: ${input.message}`);

//       const result = await agent.generate({ message: "hello" });
//       specimen.expect(result.prompt).toBe("Processed: hello");
//     });
//   });

//   specimen.describe("think", () => {
//     specimen.it("generates text", async () => {
//       const agent = new Agent("test")
//         .with("brain", mockBrain)
//         .context("Think carefully.");

//       const result = await agent.think("What is 2+2?");

//       specimen.expect(result).toBe("mocked text response");
//     });
//   });

//   specimen.describe("tools without vector", () => {
//     specimen.it("returns empty tools", () => {
//       const agent = new Agent("test");
//       specimen.expect(agent.tools).toEqual({});
//     });

//     specimen.it("returns empty toolsDocs", () => {
//       const agent = new Agent("test");
//       specimen.expect(agent.toolsDocs).toBe("");
//     });
//   });
// });

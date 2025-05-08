import { AxAgent, AxAi } from "@ax-llm/ax";

import { schemaToSignature } from "./lib/signature.js";
// import { setupMCPTools } from "./mcp.js";
// import { IntentStatusEnum } from "../lib/intent.js";
// import createIntentAnalyzer from "./intentAnalyzer.js";
// import createQuestionGenerator from "./questionGenerator.js";
// import createConfirmationManager from "./confirmationManager.js";
// import { createResolutionManager, resolveIntent } from "./resolutionManager.js";
// import sessionDiscovery from "../tools/sessionDiscovery.js";

// const { webSearchMCP, dataProcessorMCP } = await setupMCPTools();

const inputSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "User message",
    },
    // intent: {type: "object", description: "Current intent object with history and state", properties: {},},
  },
  required: ["message"],
};

const outputSchema = {
  type: "object",
  name: "Intent Resolution",
  description:
    "Used as input by the IntentResolver to navigate the user to the desired UI",
  properties: {
    status: {
      type: "string",
      enum: ["success", "failure"],
      description: "Was the users Intent discovered and resolved?",
    },
    // manifest: {type: "object", properties: {name: {type: "enum",}, description: {type: "string",}, icon: {type: "string",},},},
    resolution: {
      type: "object",
      name: "Resolution",
      description:
        "Defining the type of resolution and payload for the IntentResolver.",
      properties: {
        type: {
          type: "string",
          enum: ["failure", "session", "tactic"],
          default: "failure",
          description: "result type of intent resolution",
        },
        runtime: {
          type: "string",
          description: "Unique identifier of the resolved runtime",
        },
        slug: {
          type: "string",
          description:
            "Unique identifier of whatever entity type was resolved. for example the sessions slug.",
        },
      },
    },
  },
  required: ["status", "resolution"],
};

const description = `
Discovers and resolves user intent through conversation using a ReAct approach (Reason + Act).
you're a discovery agent operating inside the symbolic operating system "Vivalence".

you receive a user message and an intent object.
you must resolve the intent of the user, by applying tools to gather information, and run other agents to reach your goal.

your operating environment is shaped by these primitives:
each runtime provides <Valences>, which are descriptions of steps to follow in order to accomplish a specific goal.

you must accomplish the following goal:
resolve the intent.

### intent
### daemon
### runtimes

`;
const signature = schemaToSignature(description, inputSchema, outputSchema);
export const createDiscoveryAgent = async (ctx) => {
  const functions = [
    {
      name: "/daemon/runtimes/findAll",
      description: "get available runtimes, incl. example valences",
      // parameters: {type: 'object', properties: {location: {type: 'string', description: 'location to get weather for'}, units: {type: 'string', enum: ['imperial', 'metric'], default: 'imperial', description: 'units to use'}}, required: ['location']},
      func: async (args) => {
        console.log("runtime_discovery ctx", ctx);
        console.log("runtime_discovery args", args);

        return [
          {
            runtime: "eng2esp",
            valences: [
              {
                slug: "spanish-session",
                literal: `start a spanish learning session by:
    1. pulling available session[] from '/entities/session/findAll'.
    2. identity the desired session's slug.
    3. resolve Intent to a ResolutionType of SESSION.`,
              },
            ],
          },
        ];
      },
    },
    {
      name: "/runtime/eng2esp/entities/session/findAll",
      description: "get all session of the spanish learning runtime",
      parameters: {
        type: "object",
        properties: {
          // docs for mikro entities.
        },
        required: [],
      },
      func: async (args) => {
        console.log("runtime_discovery ctx", ctx);
        console.log("runtime_discovery args", args);
        return [
          {
            runtime: "eng2esp",
            valences: [
              {
                slug: "spanish-session",
                literal: `start a spanish learning session by:
    1. pulling available session[] from 'tools/entities/session/findAll'.
    2. identity the desired session's slug.
    3. resolve Intent to a ResolutionType of SESSION.`,
              },
            ],
          },
        ];
      },
    },
  ];
  // const functions = pipe(ctx, [
  //   mcp_tools,
  //   // @compile(daemon.tools['runtimes_discovery'], runtime.tools['/entities/session/findAll'])
  // ]);

  const agent = new AxAgent({
    name: "DiscoveryAgent",
    description: signature.getDescription(),
    signature: signature,
    functions: functions,
    // agents: [intentAnalyzer, questionGenerator, confirmationManager, resolutionManager,],
  });

  return runDiscoveryAgent(agent, ctx);
};

const runDiscoveryAgent = (agent, ctx) => async (intent, signal) => {
  const ai = new AxAI(ctx.services.llms.providers.profiles.STRATEGIST);

  // status: this.status,
  // manifest: this.manifest,
  // resolution: this.resolution,
  // state: this.state,

  // status = IntentStatusEnum.DISCOVERY;
  // manifest = {name: manifest.name || "", description: manifest.description || "", icon: manifest.icon || "",};
  // resolution = {type: null, state: {},};
  // if (!intent.state.discovery) {intent.state = {discovery: "INITIAL", ...intent.state, invocationTrace: [], toolResults: {}, potentialResolutions: [], conversationContext: {},};}
  // if (signal.text) {intent.chat.push({role: "user", content: signal.text, timestamp: new Date().toISOString(),});}
  // if (intent.resolved.conversation) {const response = await ai.chat([{ role: "system", content: "Help the customer with his questions" }, {role: "user", content: "I'm looking for a Macbook Pro M2 With 96GB RAM?",},]); intent = updateIndent(intent, response); return { intent, response };}

  const response = await discoveryAgent.forward(ai, {
    message: signal.text,
    // intent,
  });
  console.log("discovery agent response ", response);

  // intent.status = updatedIntent.status;
  // intent.resolution = updatedIntent.resolution;
  // intent.state = updatedIntent.state;
  // intent.updatedAt = new Date();

  // intent.history.push({
  //   role: "assistant",
  //   content: response,
  //   timestamp: new Date().toISOString(),
  // });

  // return { intent, response };
};

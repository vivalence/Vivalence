import { AxAgent, AxAI } from "@ax-llm/ax";
import { schemaToSignature } from "./lib/signature.js";

export const createDiscoveryAgent = async (daemon) => {
  const inputSchema = {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "User message",
      },
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

  const description = `### Your Identity
you're a discovery agent operating inside the symbolic ai operating system "Vivalence".
you discover and resolves user intent through deduction, induction and conversation using a ReAct approach (Reason + Act).
you must resolve the intent of the user, by applying tools to gather information, and run other agents to reach your goal.

your operating environment is shaped by these primitives:
each runtime provides <Valences>, which are descriptions of steps to follow in order to accomplish a specific goal.

you must accomplish the following goal:
resolve the users intent.
the user provides you with a message, and its your job to declare the users intent in terms and tools that are available in the accessible runtimes.
each runtime offers tools for you and the user to accomplish goals. these are called Valences.

Search for runtimes that possibly allow the user to accomplish their goal.

`;
  const signature = schemaToSignature(description, inputSchema, outputSchema);

  const functions = [
    {
      name: "/daemon/runtimes/findAll".replaceAll("/", "_"),
      description: "get available runtimes, incl. example valences",
      parameters: {
        type: "object",
        properties: {
          skill: { type: "string", description: "name of the desired skill" },
        },
        required: [], //"skill"
      },

      func: async (args) => {
        console.log("runtime discovery args", args);

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
      name: "/entities/session/findAll".replaceAll("/", "_"),
      description: "get all session of the spanish learning runtime",
      parameters: {
        type: "object",
        properties: {
          runtime: {
            type: "string",
            description: "runtime slug",
          },
        },
        required: ["runtime"],
      },
      func: async (args) => {
        console.log("session discovery args", args);
        return [
          {
            slug: "grammar_a1",
            description: "practice a1 grammar",
          },
          {
            slug: "vocabulary_a1",
            description: "practice a1 vocabulary",
          },
        ];
      },
    },
  ];

  const agent = new AxAgent({
    name: "DiscoveryAgent",
    signature: signature,
    description: signature.getDescription(),
    functions: functions,
  });

  return runDiscoveryAgent(agent, daemon);
};

const runDiscoveryAgent = (agent, daemon) => async (intent, signal) => {
  const profile = daemon.services.llm.profiles.STRATEGIST;

  const ai = new AxAI({
    name: profile.provider,
    apiKey: profile.key,
    config: { model: profile.model },
  });

  const response = await agent.forward(
    ai,
    { message: signal.text },
    { debug: true },
  );

  console.log("discovery agent response ", response);

  return response;
};

import { AxAgent } from "@ax-llm/ax";
import { setupMCPTools } from "./mcp.js";
import { schemaToSignature } from "../lib/signature.js";
import { IntentStatusEnum } from "../lib/intent.js";
import createIntentAnalyzer from "./intentAnalyzer.js";
import createQuestionGenerator from "./questionGenerator.js";
import createConfirmationManager from "./confirmationManager.js";
import { createResolutionManager, resolveIntent } from "./resolutionManager.js";
import sessionDiscovery from "../tools/sessionDiscovery.js";

export const createDiscoveryAgent = async () => {
  const { webSearchMCP, dataProcessorMCP } = await setupMCPTools();

  const intentAnalyzer = createIntentAnalyzer();
  const questionGenerator = createQuestionGenerator();
  const confirmationManager = createConfirmationManager();
  const resolutionManager = createResolutionManager();

  const inputSchema = {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "User message",
      },
      intent: {
        type: "object",
        description: "Current intent object with history and state",
      },
    },
    required: ["message", "intent"],
  };

  const outputSchema = {
    type: "object",
    properties: {
      updatedIntent: {
        type: "object",
        description: "Updated intent object",
      },
      response: {
        type: "string",
        description: "Response to user",
      },
    },
    required: ["updatedIntent", "response"],
  };

  const signature = schemaToSignature(inputSchema, outputSchema);

  return new AxAgent({
    name: "DiscoveryAgent",
    description:
      "Discovers and resolves user intent through conversation using a ReAct approach (Reason + Act)",
    signature: signature.toString(),
    functions: [sessionDiscovery, webSearchMCP, dataProcessorMCP],
    agents: [
      intentAnalyzer,
      questionGenerator,
      confirmationManager,
      resolutionManager,
    ],
  });
};

export const handleDiscovery = async (ai, intent, message) => {
  const discoveryAgent = await createDiscoveryAgent();

  if (!intent.state.discoveryPhase) {
    intent.state = {
      ...intent.state,
      discoveryPhase: "INITIAL",
      confidence: 0,
      toolResults: {},
      potentialResolutions: [],
      conversationContext: {},
    };
  }

  if (message) {
    intent.history.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });
  }

  const result = await discoveryAgent.forward(ai, {
    message:
      message || intent.history[intent.history.length - 1]?.content || "",
    intent: JSON.parse(JSON.stringify(intent)),
  });

  const { updatedIntent, response } = result;

  intent.status = updatedIntent.status;
  intent.resolution = updatedIntent.resolution;
  intent.state = updatedIntent.state;
  intent.updatedAt = new Date();

  intent.history.push({
    role: "assistant",
    content: response,
    timestamp: new Date().toISOString(),
  });

  return { intent, response };
};

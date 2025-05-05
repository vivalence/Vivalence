// packages/clients/web/src/lib/mcp/intent.js
import { get } from "svelte/store";
import { currentRuntime, availableRuntimes } from "./client.js";

export class IntentResolver {
  constructor(mcpClient) {
    this.mcpClient = mcpClient;
  }

  async resolveIntent(message, context = {}) {
    // First determine if we need to identify a runtime
    const runtime = get(currentRuntime);

    if (!runtime) {
      return await this.identifyRuntime(message);
    }

    // We have a runtime, determine specific intent
    return await this.identifyToolIntent(message, runtime);
  }

  async identifyRuntime(message) {
    // Simple keyword-based runtime identification
    // In a real implementation, this would be more sophisticated
    const runtimes = get(availableRuntimes);

    for (const runtime of runtimes) {
      const keywords = [
        runtime.id.toLowerCase(),
        runtime.name.toLowerCase(),
        ...(runtime.description
          ? runtime.description.toLowerCase().split(/\s+/)
          : []),
      ];

      const messageLower = message.toLowerCase();

      if (keywords.some((keyword) => messageLower.includes(keyword))) {
        // Found a matching runtime
        return {
          type: "runtime_selection",
          runtimeId: runtime.id,
          message: `Switching to ${runtime.name}. What would you like to do?`,
        };
      }
    }

    // No runtime identified
    return {
      type: "no_runtime",
      message:
        "I'm not sure which domain you want to work with. Can you specify which area you're interested in?",
      options: runtimes.map((r) => r.name),
    };
  }

  async identifyToolIntent(message, runtime) {
    // In a real implementation, this would be more sophisticated
    // Perhaps using a language model to identify the intent

    // Simple example for demonstration
    if (message.toLowerCase().includes("search")) {
      const query = message.replace(/search/i, "").trim();

      return {
        type: "tool_execution",
        tool: `${runtime.id}_search`,
        args: { query },
        message: `Searching for "${query}" in ${runtime.name}...`,
      };
    }

    // Default to executing a general message
    return {
      type: "general_message",
      runtimeId: runtime.id,
      message: `I'm not sure what you want to do in ${runtime.name}. Can you be more specific?`,
    };
  }
}

// Export a singleton
export const intentResolver = new IntentResolver();

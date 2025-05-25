// packages/clients/web/src/lib/mcp/client.js
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { writable, get } from "svelte/store";

// Stores for MCP state
export const currentRuntime = writable(null);
export const availableRuntimes = writable([]);
export const chatHistory = writable([]);
export const isProcessing = writable(false);

export class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.client = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    try {
      isProcessing.set(true);

      // Create WebSocket connection
      const websocket = new WebSocket(`ws://${this.serverUrl}/mcp`);

      // Create transport
      const transport = {
        send: (message) => {
          websocket.send(JSON.stringify(message));
        },
        onMessage: (callback) => {
          websocket.onmessage = (event) => {
            callback(JSON.parse(event.data));
          };
        },
      };

      // Create MCP client
      this.client = new Client(
        {
          name: "viva-web-client",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      );

      // Connect client to transport
      await this.client.connect(transport);

      // Load available runtimes
      await this.loadRuntimes();

      this.connected = true;
      console.log("Connected to MCP server");
    } catch (error) {
      console.error("Error connecting to MCP server:", error);
      throw error;
    } finally {
      isProcessing.set(false);
    }
  }

  async loadRuntimes() {
    try {
      const result = await this.executeTool("list_runtimes", {});
      availableRuntimes.set(result.runtimes || []);
      return result.runtimes;
    } catch (error) {
      console.error("Error loading runtimes:", error);
      return [];
    }
  }

  async selectRuntime(runtimeId) {
    try {
      const result = await this.executeTool("get_runtime_info", {
        runtime_id: runtimeId,
      });
      currentRuntime.set(result);
      return result;
    } catch (error) {
      console.error(`Error selecting runtime ${runtimeId}:`, error);
      throw error;
    }
  }

  async executeTool(name, args) {
    if (!this.client || !this.connected) {
      await this.connect();
    }

    try {
      isProcessing.set(true);

      const response = await this.client.request({
        method: "tools/call",
        params: {
          name,
          arguments: args,
        },
      });

      // Parse response
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if (content.type === "text") {
          try {
            return JSON.parse(content.text);
          } catch (e) {
            return content.text;
          }
        }
      }

      return null;
    } finally {
      isProcessing.set(false);
    }
  }

  // Method to execute a runtime-specific method via MCP
  async executeRuntimeMethod(runtimeId, path, body = {}) {
    return await this.executeTool("execute_runtime_method", {
      runtime_id: runtimeId,
      path,
      body,
    });
  }

  // Runtime-specific search convenience method
  async search(runtimeId, query) {
    return await this.executeTool(`${runtimeId}_search`, { query });
  }
}

// Export a singleton instance
export const mcpClient = new MCPClient(window.location.host);
// import { Client } from "npm:@modelcontextprotocol/sdk/client/index.js";
// import { StdioClientTransport } from "npm:@modelcontextprotocol/sdk/client/stdio.js";
// import { pipe } from "./fp.ts";
// import { makeInterface } from "./ui.ts";

// async function startCLI() {
//   const state: CLIState = { client: null, transport: null };
//   if (process.argv.length < 3) {
//     console.log("Usage: deno run --allow-all client/main.ts <path-to-server>");
//     process.exit(1);
//   }
//   const serverPath = process.argv[2];
//   try {
//     state.transport = new StdioClientTransport({
//       command: serverPath.endsWith(".exe")
//         ? serverPath
//         : serverPath.endsWith(".js")
//           ? "node"
//           : "deno",
//       args: serverPath.endsWith(".js")
//         ? [serverPath]
//         : serverPath.endsWith(".exe")
//           ? []
//           : ["run", "--allow-all", serverPath],
//     });
//     state.client = new Client(
//       { name: "knowledge-graph-cli", version: "1.0.0" },
//       { capabilities: {} },
//     );

//     await state.client.connect(state.transport);

//     console.log("Connected to Knowledge Graph Server");
//     console.log("Type /help for commands\n");

//     const rl = makeInterface();
//     while (true) {
//       const input = await rl.question("KGE> ");
//       const [command, ...rest] = input.split(" ");
//       const args = rest.join(" ");
//       if (commands[command]) {
//         await commands[command].handler(state, args);
//       } else {
//         console.log(
//           `Unknown command: ${command}. Type /help for available commands.`,
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//     process.exit(1);
//   }
// }

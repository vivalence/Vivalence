import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { env } from "$env/dynamic/public";

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.client = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    try {
      // env.PUBLIC_VIVA_DAEMON_URL
      const websocket = new WebSocket(`ws://${this.serverUrl}/mcp`);

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

      this.client = new Client(
        { name: "viva-web-client", version: "1.0.0" },
        { capabilities: {} },
      );

      await this.client.connect(transport);

      this.connected = true;
    } catch (error) {
      throw error;
    }
  }
  async executeTool(name, args) {
    // if (!this.client || !this.connected) {await this.connect();} try {isProcessing.set(true); const response = await this.client.request({method: "tools/call", params: {name, arguments: args,},}); // Parse response if (response.content && response.content.length > 0) {const content = response.content[0]; if (content.type === "text") {try {return JSON.parse(content.text);} catch (e) {return content.text;}}} return null;} finally {isProcessing.set(false);}
  }

  async executeRuntimeMethod(runtimeId, path, body = {}) {
    // return await this.executeTool("execute_runtime_method", {runtime_id: runtimeId, path, body,});
  }

  async search(runtimeId, query) {
    // return await this.executeTool(`${runtimeId}_search`, { query });
  }
}

export default function (ctx) {
  // console.log("mcp", ctx, env );
  // return  new MCPClient();
}

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

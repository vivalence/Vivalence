import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "npm:@modelcontextprotocol/sdk/types.js";

// daemon.aperture.use(initMCP(daemon));  // <-- Add this line

// // Set up WebSocket server for MCP

// const wss = new WebSocketServer({ noServer: true });
// const mcpTransport = new WebSocketServerTransport(wss);

// // Connect MCP server to transport
// if (daemon.mcp) {
//   await daemon.mcp.connect(mcpTransport);
// }

// const server = app.listen({ port: parseInt(config.env.get("VIVA_DAEMON_PORT")) });

// Handle WebSocket upgrade requests
// server.on("upgrade", (request, socket, head) => {
//   if (request.url === "/mcp") {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//       wss.emit("connection", ws, request);
//     });
//   }
// });

class MCPService {
  private server: Server;
  private tools = new Map();
  private daemon: any;

  constructor(daemon: any) {
    this.daemon = daemon;

    // Set up the tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Find the requested tool
      const tool = this.tools.get(name);
      if (!tool) {
        return {
          content: [{ type: "text", text: `Error: Tool "${name}" not found` }],
          isError: true,
        };
      }

      try {
        // Execute the tool
        const result = await tool.handler(args);

        // Return the result as a JSON string
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });

    // Register basic tools
    this.registerBasicTools();
  }

  async connect(transport: any) {
    await this.server.connect(transport);
    console.log("MCP Server connected");
  }

  registerTool(tool: any) {
    this.tools.set(tool.name, tool);
    console.log(`Registered MCP tool: ${tool.name}`);
  }

  private registerBasicTools() {
    // Register a tool to list available runtimes
    this.registerTool({
      name: "list_runtimes",
      description: "List all available runtime domains",
      parameters: {},
      handler: async () => {
        const runtimes = Array.from(this.daemon.runtimes.values()).map(
          (runtime) => ({
            id: runtime.config.manifest.slug,
            name: runtime.config.manifest.name || runtime.config.manifest.slug,
            description: runtime.config.manifest.description || "",
          }),
        );

        return { runtimes };
      },
    });

    // Register a tool to get runtime details
    this.registerTool({
      name: "get_runtime_info",
      description: "Get information about a specific runtime",
      parameters: {
        type: "object",
        properties: {
          runtime_id: { type: "string" },
        },
        required: ["runtime_id"],
      },
      handler: async (args) => {
        const runtime = this.daemon.runtimes.get(args.runtime_id);
        if (!runtime) {
          throw new Error(`Runtime "${args.runtime_id}" not found`);
        }

        return {
          id: runtime.config.manifest.slug,
          name: runtime.config.manifest.name || runtime.config.manifest.slug,
          description: runtime.config.manifest.description || "",
          modules: Object.keys(runtime.modules || {}),
        };
      },
    });

    // Generic tool to execute a runtime method
    this.registerTool({
      name: "execute_runtime_method",
      description: "Execute a method on a specific runtime",
      parameters: {
        type: "object",
        properties: {
          runtime_id: { type: "string" },
          path: { type: "string" },
          body: { type: "object" },
        },
        required: ["runtime_id", "path"],
      },
      handler: async (args) => {
        const runtime = this.daemon.runtimes.get(args.runtime_id);
        if (!runtime) {
          throw new Error(`Runtime "${args.runtime_id}" not found`);
        }

        try {
          return await runtime.call(args.path, args.body || {});
        } catch (error) {
          throw new Error(`Error executing method: ${error.message}`);
        }
      },
    });
  }
}

// Integration with the aperture system
export function initMCP(daemon) {
  return async (ctx, next) => {
    // Store MCP service in daemon if not already present
    if (!daemon.mcp) {
      daemon.mcp = new MCPService(daemon);

      // Register runtime-specific tools
      for (const runtime of daemon.runtimes.values()) {
        // Example of registering runtime-specific tools
        daemon.mcp.registerTool({
          name: `${runtime.config.manifest.slug}_search`,
          description: `Search in the ${runtime.config.manifest.name || runtime.config.manifest.slug} domain`,
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
          handler: async (args) => {
            // This would call your existing search functionality
            return await runtime.call("/search", { query: args.query });
          },
        });
      }
    }

    await next();
  };
}

// import { Server } from "npm:@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
// import { CallToolRequestSchema } from "npm:@modelcontextprotocol/sdk/types.js";
// import { pipe, map } from "./fp.ts";
// import { store, createNode, createEdge } from "./knowledge.ts";

// const server = new Server(
//   {
//     name: "knowledge-graph-engine",
//     version: "0.1.0",
//   },
//   {
//     capabilities: {
//       tools: {},
//     },
//   },
// );

// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   const { name, arguments: args } = request.params;

//   if (!toolHandlers[name]) {
//     throw new Error(`Unknown tool: ${name}`);
//   }

//   try {
//     const result = await toolHandlers[name](args);
//     return {
//       content: [
//         {
//           type: "text",
//           text: JSON.stringify(result, null, 2),
//         },
//       ],
//     };
//   } catch (error) {
//     return {
//       content: [
//         {
//           type: "text",
//           text: `Error: ${error.message}`,
//         },
//       ],
//       isError: true,
//     };
//   }
// });

// const transport = new StdioServerTransport();
// server
//   .connect(transport)
//   .then(() => console.log("Knowledge Graph Engine Server running..."))
//   .catch((error) => {
//     console.error("Error starting server:", error);
//     process.exit(1);
//   });

import config from "@vivalence/config";
import { Server } from "npm:@modelcontextprotocol/sdk@^1.10.0/server/index.js";

class Transport {
  constructor() {
    this.onmessage = null;
    this.pendingRequests = new Map();
  }

  async start() {}

  async send(message) {
    if (this.onmessage) {
      this.onmessage({
        jsonrpc: "2.0",
        id: message.id,
        result: { message: "Response from your LLM would go here" },
      });
    }
  }

  async handleMessages(messages) {
    console.log("handle me", messages);
    return new Promise((resolve) => {
      const id = Date.now().toString();
      this.pendingRequests.set(id, resolve);

      if (this.onmessage) {
        this.onmessage({
          jsonrpc: "2.0",
          method: "sampling/messages",
          id: id,
          params: { messages },
        });
      }
    });
  }
}

const globalTransport = new Transport();
let globalServer;

async function init(daemon) {
  globalServer = new Server(
    { name: "viva-daemon-mcp", version: "1.0.0" },
    { capabilities: { sampling: {} } },
  );

  await globalServer.connect(globalTransport);

  daemon.aperture.branch("/mcp").open("/chat", async (input) => {
    const messages = input.messages || [];
    console.log("input, messages", input, messages);
    const response = await globalTransport.handleMessages(messages);
    console.log("resopnse", response);
    return { response };
  });

  return daemon;
}

export default init;

// class Transport {
//   constructor(ctx) {
//     this.ctx = ctx;
//     this.onmessage = null;
//   }
//   async start() {
//     console.log("Started");
//   }
//   async send(message) {
//     // console.log("Sending:", message);
//     // if (this.onmessage && message.method === "tools/execute") {
//     //   const userMessage = message.
//     //   const response = await this.ctx.services.llm({ prompt: userMessage });
//     this.onmessage({
//       jsonrpc: "2.0",
//       id: message.id,
//       result: { response: "ligma" },
//     });
//     // }
//   }
// }

// async function init(daemon) {
//   const transport = new Transport(daemon);
//   const server = new Server(
//     { name: "viva-daemon-mcp", version: "1.0.0" },
//     {
//       capabilities: {
//         tools: {
//           chat: {
//             // Define a chat tool
//             description: "Send a chat message",
//             parameters: { message: { type: "string" } },
//             returns: { response: { type: "string" } },
//           },
//         },
//       },
//     },
//   );
//   await server.connect(transport);
//   daemon.aperture.branch("/mcp").open("/discovery", async (input, ctx) => {
//     // now here fucking invoke the fucking server and make it do shit!
//   });
//   return daemon;
// }

// export default { init };

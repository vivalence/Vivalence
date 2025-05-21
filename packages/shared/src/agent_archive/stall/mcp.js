import { MCPClient, MCPStdioTransport } from "@ax-llm/ax-mcp";

export const setupMCPTools = async () => {
  const searchTransport = new MCPStdioTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
  });

  const webSearchMCP = new MCPClient(searchTransport);
  await webSearchMCP.init();

  const dataTransport = new MCPStdioTransport({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-data-processor"],
  });

  const dataProcessorMCP = new MCPClient(dataTransport);
  await dataProcessorMCP.init();

  return { webSearchMCP, dataProcessorMCP };
};

import { steer } from "@vivalence/typology"

function respond(id, result) { return { jsonrpc: "2.0", id, result } }
function fail(id, code, text) { return { jsonrpc: "2.0", id, error: { code, message: text } } }

export function mcp(vector, info = {}) {
  const entries = steer.trie.rollup(vector, steer.strategy.guarded)

  const tools = entries.map(({ pattern, steps }) => ({
    name: steps.map((s) => s.nature).join("_"),
    description: pattern.valence || steps.map((s) => s.nature).join("_"),
    inputSchema: pattern.input || { type: "object" },
    ...(pattern.output ? { outputSchema: pattern.output } : {}),
  }))

  const handlers = new Map(
    entries.map(({ steps, fn }) => [steps.map((s) => s.nature).join("_"), fn])
  )

  async function handle(message) {
    switch (message.method) {
      case "initialize":
        return respond(message.id, {
          protocolVersion: "2025-11-25",
          capabilities: { tools: {} },
          serverInfo: { name: info.name, version: info.version },
        })

      case "notifications/initialized":
        return null

      case "tools/list":
        return respond(message.id, { tools })

      case "tools/call": {
        const fn = handlers.get(message.params.name)
        if (!fn) return fail(message.id, -32602, `Unknown tool: ${message.params.name}`)
        try {
          const result = await fn(message.params.arguments || {})
          return respond(message.id, {
            content: [{ type: "text", text: JSON.stringify(result) }],
            structuredContent: result,
          })
        } catch (e) {
          return respond(message.id, {
            isError: true,
            content: [{ type: "text", text: e.message }],
          })
        }
      }

      default:
        return fail(message.id, -32601, `Method not found: ${message.method}`)
    }
  }

  return { handle, tools, handlers }
}

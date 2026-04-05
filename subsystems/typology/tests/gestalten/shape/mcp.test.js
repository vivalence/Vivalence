import { specimen, v } from "@vivalence/typology";
import { Vector, shape } from "@vivalence/typology";

const { mcp } = shape;

specimen.describe("mcp shape", () => {
  specimen.describe("tool collection", () => {
    specimen.it("flat effects become tools", () => {
      const vector = new Vector();
      vector.open({ nature: "ping", valence: "Health check" }, () => "pong");

      const server = mcp(vector);
      specimen.expect(server.tools.length).toBe(1);
      specimen.expect(server.tools[0].name).toBe("ping");
      specimen.expect(server.tools[0].description).toBe("Health check");
    });

    specimen.it("branched effects join with underscore", () => {
      const vector = new Vector();
      vector.branch("find").open("literal", () => []);
      vector.branch("find").open("symbol", () => []);
      vector.branch("pick").open("feed", () => []);

      const server = mcp(vector);
      const names = server.tools.map((t) => t.name);
      specimen.expect(names).toContain("find_literal");
      specimen.expect(names).toContain("find_symbol");
      specimen.expect(names).toContain("pick_feed");
    });

    specimen.it("deep nesting joins all segments", () => {
      const vector = new Vector();
      vector.branch("pick").branch("literal").open("feed", () => []);

      const server = mcp(vector);
      specimen.expect(server.tools[0].name).toBe("pick_literal_feed");
    });

    specimen.it("carries input and output schemas", () => {
      const input = v.object({ limit: v.integer() });
      const output = v.array(v.string());
      const vector = new Vector();
      vector.open({ nature: "feed", input, output, valence: "Get feed" }, () => []);

      const server = mcp(vector);
      specimen.expect(server.tools[0].inputSchema).toBe(input);
      specimen.expect(server.tools[0].outputSchema).toBe(output);
    });

    specimen.it("defaults inputSchema to open object", () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");

      const server = mcp(vector);
      specimen.expect(server.tools[0].inputSchema).toEqual({ type: "object" });
    });

    specimen.it("omits outputSchema when absent", () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");

      const server = mcp(vector);
      specimen.expect(server.tools[0].outputSchema).toBeUndefined();
    });
  });

  specimen.describe("initialize handshake", () => {
    specimen.it("responds with JSON-RPC envelope", async () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");

      const server = mcp(vector, { name: "test-server", version: "1.0.0" });
      const response = await server.handle({ jsonrpc: "2.0", id: 1, method: "initialize" });

      specimen.expect(response.jsonrpc).toBe("2.0");
      specimen.expect(response.id).toBe(1);
      specimen.expect(response.result.protocolVersion).toBe("2025-11-25");
      specimen.expect(response.result.serverInfo.name).toBe("test-server");
      specimen.expect(response.result.capabilities.tools).toBeDefined();
    });

    specimen.it("initialized notification returns null", async () => {
      const server = mcp(new Vector());
      const response = await server.handle({ jsonrpc: "2.0", method: "notifications/initialized" });
      specimen.expect(response).toBe(null);
    });
  });

  specimen.describe("tools/list", () => {
    specimen.it("returns all tools in JSON-RPC envelope", async () => {
      const vector = new Vector();
      vector.open({ nature: "ping", valence: "Health check" }, () => "pong");
      vector.branch("find").open("literal", () => []);

      const server = mcp(vector);
      const response = await server.handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });

      specimen.expect(response.jsonrpc).toBe("2.0");
      specimen.expect(response.id).toBe(2);
      specimen.expect(response.result.tools.length).toBe(2);
    });
  });

  specimen.describe("tools/call", () => {
    specimen.it("dispatches and wraps in envelope", async () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 3, method: "tools/call",
        params: { name: "ping", arguments: {} },
      });

      specimen.expect(response.jsonrpc).toBe("2.0");
      specimen.expect(response.id).toBe(3);
      specimen.expect(response.result.structuredContent).toBe("pong");
      specimen.expect(response.result.content[0].type).toBe("text");
    });

    specimen.it("passes arguments as input", async () => {
      const vector = new Vector();
      vector.open("echo", (ctx) => ctx.input);

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 4, method: "tools/call",
        params: { name: "echo", arguments: { hello: "world" } },
      });

      specimen.expect(response.result.structuredContent).toEqual({ hello: "world" });
    });

    specimen.it("dispatches branched tool by joined name", async () => {
      const vector = new Vector();
      vector.branch("find").open("literal", () => [{ slug: "falar" }]);

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 5, method: "tools/call",
        params: { name: "find_literal", arguments: {} },
      });

      specimen.expect(response.result.structuredContent).toEqual([{ slug: "falar" }]);
    });

    specimen.it("unknown tool returns JSON-RPC error", async () => {
      const server = mcp(new Vector());
      const response = await server.handle({
        jsonrpc: "2.0", id: 6, method: "tools/call",
        params: { name: "nonexistent", arguments: {} },
      });

      specimen.expect(response.jsonrpc).toBe("2.0");
      specimen.expect(response.id).toBe(6);
      specimen.expect(response.error.code).toBe(-32602);
      specimen.expect(response.error.message).toContain("nonexistent");
    });

    specimen.it("effect error returns isError in result", async () => {
      const vector = new Vector();
      vector.open("fail", () => { throw new Error("boom"); });

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 7, method: "tools/call",
        params: { name: "fail", arguments: {} },
      });

      specimen.expect(response.jsonrpc).toBe("2.0");
      specimen.expect(response.result.isError).toBe(true);
      specimen.expect(response.result.content[0].text).toBe("boom");
    });

    specimen.it("unknown method returns JSON-RPC method-not-found", async () => {
      const server = mcp(new Vector());
      const response = await server.handle({
        jsonrpc: "2.0", id: 8, method: "resources/list",
      });

      specimen.expect(response.error.code).toBe(-32601);
    });
  });

  specimen.describe("guarded validation", () => {
    specimen.it("validates input schema", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 9, method: "tools/call",
        params: { name: "feed", arguments: { limit: 5 } },
      });

      specimen.expect(response.result.structuredContent).toBe(5);
    });

    specimen.it("rejects invalid input", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 10, method: "tools/call",
        params: { name: "feed", arguments: { limit: "abc" } },
      });

      specimen.expect(response.result.isError).toBe(true);
    });

    specimen.it("applies defaults", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer().default(10) }) },
        (ctx) => ctx.input.limit,
      );

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 11, method: "tools/call",
        params: { name: "feed", arguments: {} },
      });

      specimen.expect(response.result.structuredContent).toBe(10);
    });
  });

  specimen.describe("middleware", () => {
    specimen.it("root middleware runs on tool call", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (ctx, next) => { trace.push("mw"); ctx.enriched = true; await next(); });
      vector.open("check", (ctx) => ({ enriched: ctx.enriched }));

      const server = mcp(vector);
      const response = await server.handle({
        jsonrpc: "2.0", id: 12, method: "tools/call",
        params: { name: "check", arguments: {} },
      });

      specimen.expect(trace).toEqual(["mw"]);
      specimen.expect(response.result.structuredContent.enriched).toBe(true);
    });

    specimen.it("branch middleware accumulates", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => { trace.push("root"); await next(); });
      vector
        .branch("api")
        .use(async (_, next) => { trace.push("branch"); await next(); })
        .open("call", () => { trace.push("leaf"); return "done"; });

      const server = mcp(vector);
      await server.handle({
        jsonrpc: "2.0", id: 13, method: "tools/call",
        params: { name: "api_call", arguments: {} },
      });

      specimen.expect(trace).toEqual(["root", "branch", "leaf"]);
    });
  });
});

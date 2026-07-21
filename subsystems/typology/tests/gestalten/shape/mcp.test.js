import { specimen, v, Vector, shape } from "@vivalence/typology";

specimen.describe("mcp shape", () => {
  specimen.it("a vector's effects become named tools", () => {
    const flat = new Vector();
    flat.open({ nature: "ping", valence: "Health check" }, () => "pong");
    const flatServer = shape.mcp(flat);
    specimen.expect(flatServer.tools.length).toBe(1);
    specimen.expect(flatServer.tools[0].name).toBe("ping");
    specimen.expect(flatServer.tools[0].description).toBe("Health check");

    const branched = new Vector();
    branched.branch("find").open("literal", () => []);
    branched.branch("find").open("symbol", () => []);
    branched.branch("pick").open("feed", () => []);
    const branchedNames = shape.mcp(branched).tools.map((tool) => tool.name);
    specimen.expect(branchedNames).toContain("find_literal");
    specimen.expect(branchedNames).toContain("find_symbol");
    specimen.expect(branchedNames).toContain("pick_feed");

    const deep = new Vector();
    deep.branch("pick").branch("literal").open("feed", () => []);
    specimen.expect(shape.mcp(deep).tools[0].name).toBe("pick_literal_feed");

    const input = v.object({ limit: v.integer() });
    const output = v.array(v.string());
    const schematic = new Vector();
    schematic.open({ nature: "feed", input, output, valence: "Get feed" }, () => []);
    const schematicServer = shape.mcp(schematic);
    specimen.expect(schematicServer.tools[0].inputSchema).toBe(input);
    specimen.expect(schematicServer.tools[0].outputSchema).toBe(output);

    const bare = new Vector();
    bare.open("ping", () => "pong");
    const bareServer = shape.mcp(bare);
    specimen.expect(bareServer.tools[0].inputSchema).toEqual({ type: "object" });
    specimen.expect(bareServer.tools[0].outputSchema).toBeUndefined();
  });

  specimen.it("a server shakes hands and lists its tools", async () => {
    const vector = new Vector();
    vector.open({ nature: "ping", valence: "Health check" }, () => "pong");
    vector.branch("find").open("literal", () => []);
    const server = shape.mcp(vector, { name: "test-server", version: "1.0.0" });

    const initialized = await server.handle({ jsonrpc: "2.0", id: 1, method: "initialize" });
    specimen.expect(initialized.jsonrpc).toBe("2.0");
    specimen.expect(initialized.id).toBe(1);
    specimen.expect(initialized.result.protocolVersion).toBe("2025-11-25");
    specimen.expect(initialized.result.serverInfo.name).toBe("test-server");
    specimen.expect(initialized.result.capabilities.tools).toBeDefined();

    specimen.expect(await server.handle({ jsonrpc: "2.0", method: "notifications/initialized" })).toBe(null);

    const listing = await server.handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    specimen.expect(listing.jsonrpc).toBe("2.0");
    specimen.expect(listing.id).toBe(2);
    specimen.expect(listing.result.tools.length).toBe(2);
  });

  specimen.it("a tool call rides the json-rpc envelope", async () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");
    vector.open("echo", (context) => context.input);
    vector.branch("find").open("literal", () => [{ slug: "falar" }]);
    vector.open("fail", () => { throw new Error("boom"); });
    const server = shape.mcp(vector);

    const pinged = await server.handle({
      jsonrpc: "2.0", id: 3, method: "tools/call",
      params: { name: "ping", arguments: {} },
    });
    specimen.expect(pinged.jsonrpc).toBe("2.0");
    specimen.expect(pinged.id).toBe(3);
    specimen.expect(pinged.result.structuredContent).toBe("pong");
    specimen.expect(pinged.result.content[0].type).toBe("text");

    const echoed = await server.handle({
      jsonrpc: "2.0", id: 4, method: "tools/call",
      params: { name: "echo", arguments: { hello: "world" } },
    });
    specimen.expect(echoed.result.structuredContent).toEqual({ hello: "world" });

    const found = await server.handle({
      jsonrpc: "2.0", id: 5, method: "tools/call",
      params: { name: "find_literal", arguments: {} },
    });
    specimen.expect(found.result.structuredContent).toEqual([{ slug: "falar" }]);

    const unknown = await server.handle({
      jsonrpc: "2.0", id: 6, method: "tools/call",
      params: { name: "nonexistent", arguments: {} },
    });
    specimen.expect(unknown.jsonrpc).toBe("2.0");
    specimen.expect(unknown.id).toBe(6);
    specimen.expect(unknown.error.code).toBe(-32602);
    specimen.expect(unknown.error.message).toContain("nonexistent");

    const failed = await server.handle({
      jsonrpc: "2.0", id: 7, method: "tools/call",
      params: { name: "fail", arguments: {} },
    });
    specimen.expect(failed.jsonrpc).toBe("2.0");
    specimen.expect(failed.result.isError).toBe(true);
    specimen.expect(failed.result.content[0].text).toBe("boom");

    const unroutable = await server.handle({ jsonrpc: "2.0", id: 8, method: "resources/list" });
    specimen.expect(unroutable.error.code).toBe(-32601);
  });

  specimen.it("a guard validates, defaults and rejects", async () => {
    const guarded = new Vector();
    guarded.open(
      { nature: "feed", input: v.object({ limit: v.integer() }) },
      (context) => context.input.limit,
    );
    const guardedServer = shape.mcp(guarded);

    const valid = await guardedServer.handle({
      jsonrpc: "2.0", id: 9, method: "tools/call",
      params: { name: "feed", arguments: { limit: 5 } },
    });
    specimen.expect(valid.result.structuredContent).toBe(5);

    const invalid = await guardedServer.handle({
      jsonrpc: "2.0", id: 10, method: "tools/call",
      params: { name: "feed", arguments: { limit: "abc" } },
    });
    specimen.expect(invalid.result.isError).toBe(true);

    const defaulted = new Vector();
    defaulted.open(
      { nature: "feed", input: v.object({ limit: v.integer().default(10) }) },
      (context) => context.input.limit,
    );
    const filled = await shape.mcp(defaulted).handle({
      jsonrpc: "2.0", id: 11, method: "tools/call",
      params: { name: "feed", arguments: {} },
    });
    specimen.expect(filled.result.structuredContent).toBe(10);
  });

  specimen.it("middleware accumulates down the branch", async () => {
    const rootTrace = [];
    const enriched = new Vector();
    enriched.use(async (context, next) => { rootTrace.push("mw"); context.enriched = true; await next(); });
    enriched.open("check", (context) => ({ enriched: context.enriched }));
    const checked = await shape.mcp(enriched).handle({
      jsonrpc: "2.0", id: 12, method: "tools/call",
      params: { name: "check", arguments: {} },
    });
    specimen.expect(rootTrace).toEqual(["mw"]);
    specimen.expect(checked.result.structuredContent.enriched).toBe(true);

    const branchTrace = [];
    const layered = new Vector();
    layered.use(async (context, next) => { branchTrace.push("root"); await next(); });
    layered
      .branch("api")
      .use(async (context, next) => { branchTrace.push("branch"); await next(); })
      .open("call", () => { branchTrace.push("leaf"); return "done"; });
    await shape.mcp(layered).handle({
      jsonrpc: "2.0", id: 13, method: "tools/call",
      params: { name: "api_call", arguments: {} },
    });
    specimen.expect(branchTrace).toEqual(["root", "branch", "leaf"]);
  });
});

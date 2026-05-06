import { specimen, v } from "@vivalence/typology";
import { Vector, shape } from "@vivalence/typology";

const { agentic } = shape;

specimen.describe("agentic shape", () => {
  specimen.describe("tool collection", () => {
    specimen.it("flat effects become tools keyed by nature", () => {
      const vector = new Vector();
      vector.open({ nature: "ping", valence: "Health check" }, () => "pong");

      const compiled = agentic(vector);
      specimen.expect(Object.keys(compiled.tools)).toEqual(["ping"]);
      specimen.expect(compiled.tools.ping.valence).toBe("Health check");
      specimen.expect(typeof compiled.tools.ping.execute).toBe("function");
    });

    specimen.it("branched effects join with underscore", () => {
      const vector = new Vector();
      vector.branch("find").open("literal", () => []);
      vector.branch("find").open("symbol", () => []);
      vector.branch("pick").open("feed", () => []);

      const compiled = agentic(vector);
      const names = Object.keys(compiled.tools);
      specimen.expect(names).toContain("find_literal");
      specimen.expect(names).toContain("find_symbol");
      specimen.expect(names).toContain("pick_feed");
    });

    specimen.it("deep nesting joins all segments", () => {
      const vector = new Vector();
      vector.branch("pick").branch("literal").open("feed", () => []);

      const compiled = agentic(vector);
      specimen.expect(Object.keys(compiled.tools)).toContain("pick_literal_feed");
    });

    specimen.it("carries input and output schemas", () => {
      const input = v.object({ limit: v.integer() });
      const output = v.array(v.string());
      const vector = new Vector();
      vector.open({ nature: "feed", input, output, valence: "Get feed" }, () => []);

      const compiled = agentic(vector);
      specimen.expect(compiled.tools.feed.input).toBe(input);
      specimen.expect(compiled.tools.feed.output).toBe(output);
    });

    specimen.it("missing valence defaults to empty string", () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");

      const compiled = agentic(vector);
      specimen.expect(compiled.tools.ping.valence).toBe("");
    });
  });

  specimen.describe("llmstxt block", () => {
    specimen.it("opens with ### Tools header", () => {
      const compiled = agentic(new Vector());
      specimen.expect(compiled.llmstxt).toContain("### Tools");
    });

    specimen.it("lists each tool with its valence and schemas", () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", valence: "Fetch the feed", input: v.object({ limit: v.integer() }) },
        () => [],
      );

      const compiled = agentic(vector);
      specimen.expect(compiled.llmstxt).toContain('"feed":');
      specimen.expect(compiled.llmstxt).toContain("Fetch the feed");
      specimen.expect(compiled.llmstxt).toContain("- input:");
    });

    specimen.it("omits input/output lines when not declared", () => {
      const vector = new Vector();
      vector.open({ nature: "ping", valence: "ping" }, () => "pong");

      const compiled = agentic(vector);
      specimen.expect(compiled.llmstxt).not.toContain("- input:");
      specimen.expect(compiled.llmstxt).not.toContain("- output:");
    });
  });

  specimen.describe("execute dispatch", () => {
    specimen.it("dispatches with input on ctx", async () => {
      const vector = new Vector();
      vector.open("echo", (ctx) => ctx.input);

      const compiled = agentic(vector);
      const result = await compiled.tools.echo.execute({ hello: "world" });
      specimen.expect(result).toEqual({ hello: "world" });
    });

    specimen.it("guarded validates input schema", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const compiled = agentic(vector);
      const result = await compiled.tools.feed.execute({ limit: 5 });
      specimen.expect(result).toBe(5);
    });

    specimen.it("guarded rejects invalid input", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const compiled = agentic(vector);
      let threw = false;
      try {
        await compiled.tools.feed.execute({ limit: "abc" });
      } catch (_) {
        threw = true;
      }
      specimen.expect(threw).toBe(true);
    });

    specimen.it("middleware on parent vector runs on tool dispatch", async () => {
      const trace = [];
      const vector = new Vector();
      vector.use(async (ctx, next) => { trace.push("mw"); ctx.enriched = true; await next(); });
      vector.open("check", (ctx) => ({ enriched: ctx.enriched }));

      const compiled = agentic(vector);
      const result = await compiled.tools.check.execute({});
      specimen.expect(trace).toEqual(["mw"]);
      specimen.expect(result.enriched).toBe(true);
    });
  });

  specimen.describe("custom separator", () => {
    specimen.it("joins segments with given separator", () => {
      const vector = new Vector();
      vector.branch("find").open("literal", () => []);

      const compiled = agentic(vector, ".");
      specimen.expect(Object.keys(compiled.tools)).toContain("find.literal");
    });
  });
});

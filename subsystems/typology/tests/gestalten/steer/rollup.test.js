import { specimen, steer, v, Vector } from "@vivalence/typology";

specimen.describe("rollup", () => {
  specimen.it("a trie rolls up flat, branched and deep", () => {
    const flat = new Vector();
    flat.open("ping", () => "pong");
    flat.open("status", () => "ok");
    const flatEntries = steer.trie.rollup(flat);
    specimen.expect(flatEntries.length).toBe(2);
    specimen.expect(flatEntries[0].pattern.nature).toBe("ping");
    specimen.expect(flatEntries[1].pattern.nature).toBe("status");

    const branched = new Vector();
    branched.branch("find").open("literal", () => []);
    branched.branch("find").open("symbol", () => []);
    branched.branch("pick").open("feed", () => []);
    const branchedEntries = steer.trie.rollup(branched);
    specimen.expect(branchedEntries.length).toBe(3);
    const names = branchedEntries.map((entry) => entry.steps.map((step) => step.nature).join("_"));
    specimen.expect(names).toContain("find_literal");
    specimen.expect(names).toContain("find_symbol");
    specimen.expect(names).toContain("pick_feed");

    const deep = new Vector();
    deep.branch("a").branch("b").open("c", () => "deep");
    const deepEntries = steer.trie.rollup(deep);
    specimen.expect(deepEntries.length).toBe(1);
    specimen.expect(deepEntries[0].steps.map((step) => step.nature)).toEqual(["a", "b", "c"]);

    specimen.expect(steer.trie.rollup(new Vector())).toEqual([]);
  });

  specimen.it("an entry is callable at every arity", async () => {
    const greeter = new Vector();
    greeter.open("greet", () => "hello");
    const [greeting] = steer.trie.rollup(greeter);
    specimen.expect(await greeting.fn()).toBe("hello");

    const echoer = new Vector();
    echoer.open("echo", (ctx) => ctx.input);
    const [echoing] = steer.trie.rollup(echoer);
    specimen.expect(await echoing.fn("ping")).toBe("ping");

    const adder = new Vector();
    adder.open("add", (input, ctx) => input.a + input.b);
    const [adding] = steer.trie.rollup(adder);
    specimen.expect(await adding.fn({ a: 2, b: 3 })).toBe(5);
  });

  specimen.it("middleware accumulates down the branch into the effect", async () => {
    const rooted = [];
    const rootVector = new Vector();
    rootVector.use(async (ctx, next) => { rooted.push("root"); await next(); });
    rootVector.open("action", () => { rooted.push("effect"); return "done"; });
    const [rootEntry] = steer.trie.rollup(rootVector);
    await rootEntry.fn();
    specimen.expect(rooted).toEqual(["root", "effect"]);

    const layered = [];
    const layeredVector = new Vector();
    layeredVector.use(async (ctx, next) => { layered.push("root"); await next(); });
    layeredVector
      .branch("api")
      .use(async (ctx, next) => { layered.push("branch"); await next(); })
      .open("call", () => { layered.push("leaf"); });
    const [layeredEntry] = steer.trie.rollup(layeredVector);
    await layeredEntry.fn();
    specimen.expect(layered).toEqual(["root", "branch", "leaf"]);

    const enriching = new Vector();
    enriching.use(async (ctx, next) => { ctx.enriched = true; await next(); });
    enriching.branch("api").open("check", (ctx) => ctx.enriched);
    const [enrichedEntry] = steer.trie.rollup(enriching);
    specimen.expect(await enrichedEntry.fn()).toBe(true);
  });

  specimen.it("metadata rides the pattern edge", () => {
    const withInput = new Vector();
    const schema = v.object({ limit: v.integer() });
    withInput.open({ nature: "feed", input: schema }, () => []);
    const [inputEntry] = steer.trie.rollup(withInput);
    specimen.expect(inputEntry.pattern.input).toBe(schema);

    const withValence = new Vector();
    withValence.open({ nature: "feed", valence: "fetch items" }, () => []);
    const [valenceEntry] = steer.trie.rollup(withValence);
    specimen.expect(valenceEntry.pattern.valence).toBe("fetch items");

    const withOutput = new Vector();
    const output = v.array(v.string());
    withOutput.open({ nature: "feed", output }, () => []);
    const [outputEntry] = steer.trie.rollup(withOutput);
    specimen.expect(outputEntry.pattern.output).toBe(output);
  });

  specimen.it("a guarded strategy validates, rejects and defaults", async () => {
    const guarded = new Vector();
    guarded.open(
      { nature: "feed", input: v.object({ limit: v.integer() }) },
      (ctx) => ctx.input.limit,
    );
    const [guardedEntry] = steer.trie.rollup(guarded, steer.strategy.guarded);
    specimen.expect(await guardedEntry.fn({ limit: 5 })).toBe(5);

    let threw = false;
    try { await guardedEntry.fn({ limit: "abc" }); }
    catch (error) { threw = error.code === "VALIDATION"; }
    specimen.expect(threw).toBe(true);

    const defaulted = new Vector();
    defaulted.open(
      { nature: "feed", input: v.object({ limit: v.integer().default(10) }) },
      (ctx) => ctx.input.limit,
    );
    const [defaultedEntry] = steer.trie.rollup(defaulted, steer.strategy.guarded);
    specimen.expect(await defaultedEntry.fn({})).toBe(10);
  });
});

import { ReplSignal, shape, specimen, steer, Vector } from "@vivalence/typology";

const console_ = new Vector()
  .open({ nature: "/help", valence: "list. Example: /help" }, () => "HELP")
  .open({ nature: "/mode/console/whoami", valence: "the terminal's id. Example: /mode/console/whoami" }, (ctx) => ({ terminal: ctx.terminal }));

specimen.describe("shape.repl — wire is the ana of strip; the leaf decides what a stripped effect becomes", () => {
  specimen.it("the repl leaf: the strip comes back as the patterns it was; an effect SENDS the signal", async () => {
    const sent = [];
    const wired = shape.repl.wire(shape.strip(console_), shape.repl.repl((signal) => sent.push(signal.argv)));
    specimen.expect(shape.strip(wired)).toEqual(shape.strip(console_));
    await steer.dispatch.execute(wired, { signal: new ReplSignal("/mode/console/whoami") }, new ReplSignal("/mode/console/whoami"));
    specimen.expect(sent).toEqual([["mode/console/whoami"]]);
  });

  specimen.it("the tool leaf: the same node as a TOOL — input is the universal Call, the call carries a Signal { nature, body, flags }", async () => {
    const calls = [];
    const tools = shape.repl.wire(shape.strip(console_), shape.repl.tool((signal) => { calls.push(signal); return { terminal: "t1" }; }));
    const names = steer.trie.rollup(tools, () => null).map((entry) => entry.steps.map((step) => step.nature).join("_"));
    specimen.expect(names).toEqual(["help", "mode_console_whoami"]);
    const [, whoami] = steer.trie.rollup(tools, () => null);
    specimen.expect(whoami.pattern.valence).toBe("the terminal's id. Example: /mode/console/whoami");
    specimen.expect(Object.keys(whoami.pattern.input.properties)).toEqual(["body", "flags"]);
    const output = await steer.dispatch.invoke(tools, "/mode/console/whoami", steer.strategy.guarded)({ body: [], flags: {} });
    specimen.expect(output).toEqual({ terminal: "t1" });
    specimen.expect(calls).toEqual([{ nature: "/mode/console/whoami", body: [], flags: {} }]);
  });

  specimen.it("a Signal { nature, body, flags } off the wire seats as a ReplSignal — the nature is the route, body and flags ride (m96 ruling 11)", () => {
    const seated = new ReplSignal({ nature: "/mode/console/whoami", body: ["ciao"], flags: { pace: "40ms" } });
    specimen.expect(seated.pathname).toBe("/mode/console/whoami");
    specimen.expect(seated.absolute).toEqual(["mode", "console", "whoami"]);
    specimen.expect(seated.body).toEqual(["ciao"]);
    specimen.expect(seated.flags).toEqual({ pace: "40ms" });
    specimen.expect(new ReplSignal({ nature: "/help", body: [], flags: {} }).pathname).toBe("/help");
  });

  specimen.it("a branch with no effect is a bare node under either leaf", () => {
    const tools = shape.repl.wire(shape.strip(console_), shape.repl.tool(() => null));
    specimen.expect(tools.trie.get("mode").trajectory.effect).toBe(null);
    specimen.expect(tools.trie.get("mode").trajectory.trie.get("console").trajectory.effect).toBe(null);
  });
});

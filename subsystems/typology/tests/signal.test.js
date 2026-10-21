import { specimen, is, Argv, Pattern, ReplSignal, Signal } from "@vivalence/typology";

specimen.describe("Signal", () => {
  specimen.it("a command line becomes a tree", () => {
    const slashed = new Signal("users/123/profile");
    specimen.expect(is.signal(slashed)).toBeTruthy();
    specimen.expect(is.signature(slashed)).toBeTruthy();
    specimen.expect(slashed.nature).toBe("users");
    specimen.expect(slashed.gauges.length).toBe(1);
    specimen.expect(slashed.absolute).toEqual(["users", "123", "profile"]);
    specimen.expect(slashed.pathname).toBe("/users/123/profile");

    specimen.expect(new Signal("lighthouse connect status").absolute).toEqual(["lighthouse", "connect", "status"]);
    specimen.expect(new Signal("lighthouse/connect status").absolute).toEqual(["lighthouse", "connect", "status"]);
    specimen.expect(new Signal("lighthouse connect --url http://x").pathname).toBe("/lighthouse/connect");

    const root = new Signal("users");
    const child = root.branch("123");
    specimen.expect(child.trace).toBe(root);
    specimen.expect(child.index).toBe(1);
    specimen.expect(root.gauges.length).toBe(1);
  });

  specimen.it("flags in every dialect", () => {
    const dialects = [
      ["lighthouse connect --url http://localhost:3000 --verbose", { url: "http://localhost:3000", verbose: true }],
      ["deploy --env=production --port=8080", { env: "production", port: "8080" }],
      ['emit --message "hello world" --target users', { message: "hello world", target: "users" }],
      ["--verbose --dry-run", { verbose: true, "dry-run": true }],
      ["deploy -v", { v: true }],
      ["deploy -p 8080 -e production", { p: "8080", e: "production" }],
      ["deploy -vfs", { v: true, f: true, s: true }],
      ["deploy -p=8080", { p: "8080" }],
      ["deploy -v --port 8080 -e=production --dry-run", { v: true, port: "8080", e: "production", "dry-run": true }],
    ];
    for (const [wire, flags] of dialects) {
      const signal = new Signal(wire);
      specimen.expect(signal.flags).toEqual(flags);
    }

    specimen.expect(new Signal("--verbose --dry-run").nature).toBe(null);

    const terminated = new Signal("run --verbose -- --not-a-flag positional");
    specimen.expect(terminated.absolute).toEqual(["run", "--not-a-flag", "positional"]);
    specimen.expect(terminated.flags).toEqual({ verbose: true });

    specimen.expect(new Signal("cat -").absolute).toEqual(["cat", "-"]);

    specimen.expect(new Signal("lighthouse connect --url http://localhost:3000 --verbose").json).toEqual({
      nature: "/lighthouse/connect",
      body: undefined,
      flags: { url: "http://localhost:3000", verbose: true },
    });
  });

  specimen.it("a signal meets a pattern", () => {
    specimen.expect(new Pattern("users").apply(new Signal("users"))?.nature).toBe("users");
    specimen.expect(new Pattern("users").apply(new Signal("posts"))).toBe(null);

    const route = new Pattern("/lighthouse/connect");
    const spoken = new Signal("lighthouse connect --url http://localhost:3000");
    specimen.expect(route.apply(spoken)).toBeTruthy();
    specimen.expect(spoken.flags).toEqual({ url: "http://localhost:3000" });
    specimen.expect(route.gauges[0].apply(spoken.gauges[0])).toBeTruthy();
  });

  specimen.it("flags are the root's own, and only when one was typed", () => {
    const spoken = new Signal("deploy/now --env production");
    specimen.expect(Object.hasOwn(spoken, "flags")).toBe(true);
    specimen.expect(spoken.gauges[0].flags).toBe(undefined);
    specimen.expect(Object.hasOwn(new Signal("users/123/profile"), "flags")).toBe(false);
    specimen.expect(new Signal("--verbose --dry-run").flags).toEqual({ verbose: true, "dry-run": true });
  });

  specimen.it("a URL is its pathname, its query the flags", () => {
    specimen.expect(new Signal(new URL("http://localhost/entities/mode?limit=5&q=a")).json).toEqual({ nature: "/entities/mode", body: undefined, flags: { limit: "5", q: "a" } });
    specimen.expect(new Signal(new URL("http://localhost/?limit=5")).json).toEqual({ nature: "/", body: undefined, flags: { limit: "5" } });
    specimen.expect(new Signal(new URL("http://localhost/entities?limit=1&limit=2")).flags).toEqual({ limit: "2" });
    specimen.expect(() => new Signal(new URL("http://localhost/a?0=x"))).toThrow("--0: numbered flags are refused");
  });

  specimen.it("a numbered flag is refused", () => {
    specimen.expect(() => new Signal("x --0")).toThrow("--0: numbered flags are refused");
    specimen.expect(() => new Signal("x -1")).toThrow("--1: numbered flags are refused");
  });

  specimen.it("rebase re-roots and carries only what the signal owns", () => {
    const flagged = new Signal("instance/use --ledger").rebase("command");
    specimen.expect([flagged.pathname, flagged.flags]).toEqual(["/command/instance/use", { ledger: true }]);
    const bare = new Signal("instance/use").rebase("command");
    specimen.expect([bare.pathname, Object.hasOwn(bare, "flags"), Object.hasOwn(bare, "body")]).toEqual(["/command/instance/use", false, false]);
  });

  specimen.it("Signal.tokens splits a typed line quote-aware without the string row's --k=v split", () => {
    specimen.expect(Signal.tokens('instance/create --slug=italian "my words" x')).toEqual(["instance/create", "--slug=italian", "my words", "x"]);
  });

  specimen.it("Argv reads a line as its words: a string and its argv array mint the same signal", () => {
    for (const line of ["/chrome", "/x --json y", "/x --json", "/x -- --raw"]) specimen.expect(new Argv(line).json).toEqual(new Argv(Signal.tokens(line)).json);
    specimen.expect([new Argv("/chrome").flags, new Argv("/chrome").body]).toEqual([{}, []]);
  });

  specimen.it("a Signal kind mints from another kind: the path, then its body and flags; its own kind passes through", () => {
    const argv = new Argv(["/terminal/open", "--json", "x"]);
    const repl = new ReplSignal(argv);
    specimen.expect([repl instanceof ReplSignal, repl.pathname, repl.flags, repl.body]).toEqual([true, "/terminal/open", { json: true }, ["x"]]);
    specimen.expect(new ReplSignal(new Signal(new URL("http://localhost/terminal/open?json=1"))).flags).toEqual({ json: "1" });
    specimen.expect(new Argv(argv)).toBe(argv);
  });

  specimen.it("a pattern never writes on the signal it is asked about: wildcard · remainder · parameter answer a copy", () => {
    const signal = new Signal("/dock");
    const wild = new Pattern("*").apply(signal);
    const rest = new Pattern("(.*)").apply(signal);
    const param = new Pattern(":slug").apply(signal);
    specimen.expect([wild.type, rest.type, param.parameters]).toEqual(["wildcard", "remainder", { slug: "dock" }]);
    specimen.expect([signal.type, signal.parameters, wild === signal, param === signal]).toEqual([undefined, undefined, false, false]);
  });
});

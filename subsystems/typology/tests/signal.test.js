import { specimen, is, fromm, Pattern, Signal } from "@vivalence/typology";

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
      specimen.expect((signal.fin ?? signal).flags).toEqual(flags);
    }

    specimen.expect(new Signal("--verbose --dry-run").nature).toBe(null);

    const terminated = new Signal("run --verbose -- --not-a-flag positional");
    specimen.expect(terminated.absolute).toEqual(["run", "--not-a-flag", "positional"]);
    specimen.expect(terminated.fin.flags).toEqual({ verbose: true });

    specimen.expect(new Signal("cat -").absolute).toEqual(["cat", "-"]);

    specimen.expect(new Signal("lighthouse connect --url http://localhost:3000 --verbose").json).toEqual({
      signal: "/lighthouse/connect",
      parts: ["lighthouse", "connect"],
      flags: { url: "http://localhost:3000", verbose: true },
    });
  });

  specimen.it("a signal meets a pattern", () => {
    specimen.expect(new Pattern("users").apply(new Signal("users"))?.nature).toBe("users");
    specimen.expect(new Pattern("users").apply(new Signal("posts"))).toBe(null);

    const route = new Pattern("/lighthouse/connect");
    const spoken = new Signal("lighthouse connect --url http://localhost:3000");
    specimen.expect(route.apply(spoken)).toBeTruthy();
    specimen.expect(spoken.gauges[0].flags).toEqual({ url: "http://localhost:3000" });
    specimen.expect(route.gauges[0].apply(spoken.gauges[0])).toBeTruthy();

    specimen.expect(fromm.signal(spoken).flags).toEqual({ url: "http://localhost:3000" });
    specimen.expect(fromm.signal(new Signal("deploy --env production --verbose")).flags).toEqual({ env: "production", verbose: true });
    specimen.expect(fromm.signal(new Signal("users/123/profile")).flags).toEqual({});
    specimen.expect(fromm.signal(new Signal("--verbose --dry-run")).flags).toEqual({ verbose: true, "dry-run": true });
  });
});

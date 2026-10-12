import { specimen, is } from "@vivalence/typology";
import { Argv } from "../prototypes/argv.js";

const { describe, it, expect } = specimen;

describe("Argv — every line viva is handed reads as one Signal", () => {
  it("an argv is a signature; the command path is its nature chain", () => {
    const signal = new Argv(["instance/clone", "@from", "./to", "--flag"]);
    expect(is.signature(signal)).toBeTruthy();
    expect([signal.nature, signal.fin.nature, signal.array.length]).toEqual(["instance", "clone", 2]);
  });

  it("a single segment has no fin", () => {
    const signal = new Argv(["install"]);
    expect([signal.nature, signal.fin]).toEqual(["install", null]);
  });

  it("the body is always an array; a boolean flag and a --key=value flag", () => {
    expect(new Argv(["instance/use", "italian"]).body).toEqual(["italian"]);
    expect(new Argv(["instance/clone", "@from", "./to"]).body).toEqual(["@from", "./to"]);
    expect(new Argv(["status"]).body).toEqual([]);
    expect(new Argv(["cmd", "--flag"]).flags.flag).toBe(true);
    expect(new Argv(["cmd", "--name=viva"]).flags.name).toBe("viva");
  });

  it("a positional opening { or [ is parsed in place; one that fails stays the string", () => {
    expect(new Argv(["instance/use", '{"json":"possible"}']).body).toEqual([{ json: "possible" }]);
    expect(new Argv(["instance/use", "[1,2]"]).body).toEqual([[1, 2]]);
    expect(new Argv(["instance/use", "1", "2"]).body).toEqual(["1", "2"]);
    expect(new Argv(["x", "{oops"]).body).toEqual(["{oops"]);
    expect(new Argv(["instance/use", "7"]).body).toEqual(["7"]);
  });

  it("body and flags are the root's own; no segment carries them", () => {
    const signal = new Argv(["instance/stop", "target", "--force"]);
    expect([Object.hasOwn(signal, "body"), Object.hasOwn(signal, "flags"), Object.hasOwn(signal.fin, "flags")]).toEqual([true, true, false]);
    expect(signal.json).toEqual({ nature: "/instance/stop", body: ["target"], flags: { force: true } });
  });

  it("install instance localhost ~/test: one segment, three positionals, the tilde untouched", () => {
    const signal = new Argv(["install", "instance", "localhost", "~/test"]);
    expect([signal.nature, signal.body, signal.flags]).toEqual(["install", ["instance", "localhost", "~/test"], {}]);
  });

  it("a deep path is four segments", () => {
    const signal = new Argv(["paladin/scope/registry/mount", "/path/to/instance"]);
    expect([signal.nature, signal.array.length, signal.body]).toEqual(["paladin", 4, ["/path/to/instance"]]);
  });

  it("an @owner/slug positional stays one element; mixed value and boolean flags", () => {
    const run = new Argv(["run", "target", "@vivalence/foo", "--mode=fast", "--detached", "--port=3000"]);
    expect([run.body, run.flags]).toEqual([["target", "@vivalence/foo"], { mode: "fast", detached: true, port: "3000" }]);
  });

  it("a leading flag precedes the path; viva --json instance/use x reads as instance/use x --json", () => {
    const leading = new Argv(["--json", "instance/use", "x"]);
    expect([leading.absolute, leading.body, leading.flags]).toEqual([["instance", "use"], ["x"], { json: true }]);
  });

  it("a bare -- ends the flags; every token after it is an element of the body", () => {
    const dashed = new Argv(["ledger/run", "--verbose", "--", "--not-a-flag", "x"]);
    expect([dashed.body, dashed.flags]).toEqual([["--not-a-flag", "x"], { verbose: true }]);
  });

  it("flags alone carry no nature; an empty argv has none either", () => {
    const flagged = new Argv(["--help", "--verbose"]);
    expect([flagged.nature, flagged.body, flagged.flags]).toEqual([null, [], { help: true, verbose: true }]);
    expect([new Argv([]).nature, new Argv([]).body]).toEqual([undefined, []]);
  });

  it("a leading slash on the command path reads the same as none", () => {
    expect(new Argv(["/instance/run", "target"]).pathname).toBe(new Argv(["instance/run", "target"]).pathname);
  });

  it("a path string still splits, and rebase carries body and flags", () => {
    expect(new Argv("/a/b").absolute).toEqual(["a", "b"]);
    const rebased = new Argv(["instance/use", "x", "--ledger"]).rebase("command");
    expect([rebased.absolute, rebased.body, rebased.flags]).toEqual([["command", "instance", "use"], ["x"], { ledger: true }]);
  });

  it("a numbered flag is refused", () => {
    expect(() => new Argv(["x", "--0"])).toThrow("--0: numbered flags are refused");
  });
});

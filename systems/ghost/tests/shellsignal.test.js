import { assert, assertEquals } from "@std/assert";
import { is } from "@vivalence/typology";
import { ShellSignal } from "../prototypes/shellsignal.js";

Deno.test("ShellSignal: coerces argv array into signature", () => {
  const signal = new ShellSignal(["instance/clone", "@from", "./to", "--flag"]);
  assert(is.signature(signal));
});

Deno.test("ShellSignal: splits command path into nature chain", () => {
  const signal = new ShellSignal(["instance/clone"]);
  assertEquals(signal.nature, "instance");
  assertEquals(signal.fin.nature, "clone");
  assertEquals(signal.array.length, 2);
});

Deno.test("ShellSignal: single-segment command has no fin", () => {
  const signal = new ShellSignal(["install"]);
  assertEquals(signal.nature, "install");
  assertEquals(signal.fin, null);
});

Deno.test("ShellSignal: indexes positional params by position", () => {
  const signal = new ShellSignal(["instance/clone", "@from", "./to"]);
  assertEquals(signal.params[0], "@from");
  assertEquals(signal.params[1], "./to");
  assertEquals(signal.params.length, 2);
});

Deno.test("ShellSignal: boolean flag", () => {
  const signal = new ShellSignal(["cmd", "--flag"]);
  assertEquals(signal.flags.flag, true);
});

Deno.test("ShellSignal: --key=value form", () => {
  const signal = new ShellSignal(["cmd", "--name=viva"]);
  assertEquals(signal.flags.name, "viva");
});

Deno.test("ShellSignal: absolute reconstructs original argv", () => {
  const signal = new ShellSignal(["instance/clone", "@from", "./to", "--flag"]);
  assertEquals(signal.absolute, ["instance/clone", "@from", "./to", "--flag"]);
});

Deno.test("ShellSignal: rebuild preserves nature chain", () => {
  const original = new ShellSignal(["instance/clone", "@from", "./to", "--flag"]);
  const rebuilt = new ShellSignal(original.absolute);
  assertEquals(rebuilt.nature, "instance");
  assertEquals(rebuilt.fin.nature, "clone");
});

Deno.test("ShellSignal: rebuild preserves params", () => {
  const original = new ShellSignal(["instance/clone", "@from", "./to"]);
  const rebuilt = new ShellSignal(original.absolute);
  assertEquals(rebuilt.params, ["@from", "./to"]);
});

Deno.test("ShellSignal: rebuild preserves flags", () => {
  const original = new ShellSignal(["cmd", "--flag", "--name=viva"]);
  const rebuilt = new ShellSignal(original.absolute);
  assertEquals(rebuilt.flags.flag, true);
  assertEquals(rebuilt.flags.name, "viva");
});

Deno.test("ShellSignal: idempotent across two rebuild cycles", () => {
  const first = new ShellSignal(["instance/clone", "@from", "./to", "--flag"]);
  const second = new ShellSignal(first.absolute);
  assertEquals(second.absolute, first.absolute);
});

// Realistic shell argv shapes a ghost client might see.

Deno.test("ShellSignal: install instance localhost ~/test", () => {
  const signal = new ShellSignal(["install", "instance", "localhost", "~/test"]);
  assertEquals(signal.nature, "install");
  assertEquals(signal.fin, null);
  assertEquals(signal.params, ["instance", "localhost", "~/test"]);
  assertEquals(signal.flags, {});
});

Deno.test("ShellSignal: instance/start target", () => {
  const signal = new ShellSignal(["instance/start", "target-name"]);
  assertEquals(signal.nature, "instance");
  assertEquals(signal.fin.nature, "start");
  assertEquals(signal.params, ["target-name"]);
});

Deno.test("ShellSignal: instance/stop with --force", () => {
  const signal = new ShellSignal(["instance/stop", "target", "--force"]);
  assertEquals(signal.fin.nature, "stop");
  assertEquals(signal.params, ["target"]);
  assertEquals(signal.flags.force, true);
});

Deno.test("ShellSignal: bare command, no args", () => {
  const signal = new ShellSignal(["status"]);
  assertEquals(signal.nature, "status");
  assertEquals(signal.params, []);
  assertEquals(signal.flags, {});
});

Deno.test("ShellSignal: deep path /paladin/scope/registry/mount", () => {
  const signal = new ShellSignal(["paladin/scope/registry/mount", "/path/to/instance"]);
  assertEquals(signal.nature, "paladin");
  assertEquals(signal.absolute, ["paladin/scope/registry/mount", "/path/to/instance"]);
  assertEquals(signal.array.length, 4);
  assertEquals(signal.params, ["/path/to/instance"]);
});

Deno.test("ShellSignal: registry-prefixed positional @vivalence/foo", () => {
  const signal = new ShellSignal(["install", "wafer", "@vivalence/foo", "/dest"]);
  assertEquals(signal.params, ["wafer", "@vivalence/foo", "/dest"]);
});

Deno.test("ShellSignal: multiple flags, mixed value and boolean", () => {
  const signal = new ShellSignal(["run", "target", "--mode=fast", "--detached", "--port=3000"]);
  assertEquals(signal.params, ["target"]);
  assertEquals(signal.flags.mode, "fast");
  assertEquals(signal.flags.detached, true);
  assertEquals(signal.flags.port, "3000");
});

Deno.test("ShellSignal: leading slash command path", () => {
  const signal = new ShellSignal(["/instance/run", "target"]);
  assertEquals(signal.nature, "instance");
  assertEquals(signal.fin.nature, "run");
  assertEquals(signal.params, ["target"]);
});

Deno.test("ShellSignal: tilde-expanded path positional", () => {
  const signal = new ShellSignal(["install", "instance", "localhost", "~/test"]);
  assertEquals(signal.params[2], "~/test");
});

Deno.test("ShellSignal: empty argv", () => {
  const signal = new ShellSignal([]);
  assertEquals(signal.nature, undefined);
  assertEquals(signal.params, undefined);
});

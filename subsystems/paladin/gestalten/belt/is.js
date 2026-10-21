import { CurrentOS, CurrentRuntime, OperatingSystem, Runtime } from "@cross/runtime";

// whatever can be computed from role, mode, and runtime.
export default function (paladin) {
  paladin.is = {
    // envoy // citizen
    get sudo() {
      return ["SUDO"].includes(paladin.role);
    },
    get dev() {
      return paladin.mode === "DEVELOPMENT";
    },
    get prod() {
      return paladin.mode === "PRODUCTION";
    },
    get runtime() {
      return paladin.role === "RUNTIME";
    },
    get client() {
      return paladin.role === "CLIENT";
    },
    get deployed() {
      // no write access
      return (
        ["CLIENT"].includes(paladin.role) ||
        [Runtime.Browser].includes(CurrentRuntime)
      );
    },
    get citizen() {
      if (paladin.deployed) return false;
      // write access
      return [Runtime.Deno, Runtime.Bun, Runtime.Node].includes(CurrentRuntime);
    },
    get tty() {
      return [Runtime.Deno].includes(CurrentRuntime) && Deno.stdin.isTerminal();
    },
    get stderrTerminal() {
      return [Runtime.Deno].includes(CurrentRuntime) && Deno.stderr.isTerminal();
    },
    get browser() {
      return [Runtime.Browser].includes(CurrentRuntime);
    },
    get apple() {
      return [OperatingSystem.macOS, OperatingSystem.iOS].includes(CurrentOS);
    },
    get veryimportant() {
      // load registry
      return ["SUDO", "RUNTIME"].includes(paladin.role);
    },
  };
}

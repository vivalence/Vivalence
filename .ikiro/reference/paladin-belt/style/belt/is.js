import { CurrentOS, CurrentRuntime, OperatingSystem, Runtime } from "@cross/runtime";

export const is = (paladin) => {
  paladin.is = {
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
      return (
        ["CLIENT"].includes(paladin.role) ||
        [Runtime.Browser].includes(CurrentRuntime)
      );
    },
    get citizen() {
      if (paladin.deployed) return false;
      return [Runtime.Deno, Runtime.Bun, Runtime.Node].includes(CurrentRuntime);
    },
    get tty() {
      return [Runtime.Deno].includes(CurrentRuntime) && Deno.stdin.isTerminal();
    },
    get browser() {
      return [Runtime.Browser].includes(CurrentRuntime);
    },
    get apple() {
      return [OperatingSystem.macOS, OperatingSystem.iOS].includes(CurrentOS);
    },
    get veryimportant() {
      return ["SUDO", "RUNTIME"].includes(paladin.role);
    },
  };
};

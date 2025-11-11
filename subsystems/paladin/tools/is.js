import { CurrentRuntime, Runtime } from "@cross/runtime";

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
    get envoy() {
      // no write access
      // return ["CLIENT", "PROCESS", "SERVICE"].includes(paladin.role);
      return [Runtime.Browser, Runtime.Workerd].includes(CurrentRuntime);
    },
    get citizen() {
      // write access
      // return ["RUNTIME", "GHOST"].includes(paladin.role);
      return [Runtime.Deno, Runtime.Bun, Runtime.Node].includes(CurrentRuntime);
    },
    get veryimportant() {
      // load registry
      return ["SUDO", "RUNTIME"].includes(paladin.role);
    },
  };
}

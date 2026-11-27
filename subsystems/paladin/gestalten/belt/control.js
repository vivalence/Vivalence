export const control = (paladin) => {
  paladin.control = (controller) => {
    if (paladin.is.browser) {
      globalThis.addEventListener("pagehide", () => controller.kill("SIGTERM", "pagehide"));
    } else {
      for (const signal of ["SIGINT", "SIGQUIT", "SIGTERM"]) {
        Deno.addSignalListener(signal, () => controller.kill("SIGTERM", signal));
      }
    }
    paladin.telemetry.follow(controller);
    return controller;
  };
};

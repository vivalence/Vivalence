export default function control(paladin) {
  paladin.control = (controller) => {
    for (const signal of ["SIGINT", "SIGQUIT", "SIGTERM"]) Deno.addSignalListener(signal, () => controller.kill("SIGTERM", signal));
    return controller;
  };
}

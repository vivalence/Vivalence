import config from "@vivalence/config";

export default async function process(viva) {
  // shutdown and multiple deno instances on watchmode are still eluding me.
  function doShutdown(signal, opts = null) {
    signal && config.isDev && console.warn(`Received system shutdown signal: "${signal}"`);
    if (signal) {
      console.log(colors.rgb24(`Viva el fin. ${signal.toString()}`, 0x00fffb));
    }
    Deno.exit(0);
  }

  viva.process = { doShutdown: doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}

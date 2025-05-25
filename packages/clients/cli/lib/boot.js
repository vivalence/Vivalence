// import { colors } from "@cliffy/ansi/colors";

export default async function captureProcess(viva) {
  function doShutdown(signal, opts = {}) {
    console.log("doShutdown", signal, opts);

    if (signal) {
      console.log(`Viva el fin. ${signal.toString()}`);
    }
    Deno.exit(0);
  }

  viva.process = { doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, doShutdown);
  }

  return viva;
}

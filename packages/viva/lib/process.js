import { colors } from "@cliffy/ansi/colors";

export default async function captureProcess(viva) {
  // console.log(colors.rgb24(`Viva la Vivalence!`, 0x00fffb));
  function doShutdown(signal, opts = {}) {
    if (signal) {
      console.log(colors.rgb24(`Viva el fin. ${signal.toString()}`, 0x00fffb));
    }
    Deno.exit(0);
  }

  viva.process = { doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}

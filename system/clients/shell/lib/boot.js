export default async function captureProcess(client) {
  function doShutdown(signal, opts = {}) {
    console.log("doShutdown", signal, opts);

    if (signal) {
      console.log(`Viva el fin. ${signal.toString()}`);
    }
    Deno.exit(0);
  }

  client.process = { doShutdown };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, () => doShutdown(signal));
  }

  return client;
}

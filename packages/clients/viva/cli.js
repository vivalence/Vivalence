let process;

function shutdown(signal) {
  if (process) {
    process.close();
  }
  Deno.exit(0);
}

try {
  // needs to know / store / remember the root dir of the repo
  process = Deno.run({ cmd: ["deno", "task", "-q", `viva`, ...Deno.args] });
  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, shutdown);
  }
  await process.status();
} catch (error) {
  console.error("[ERROR] in viva:");
  console.error(error);
} finally {
  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.removeSignalListener(signal, shutdown);
  }
}

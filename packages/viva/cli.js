let process;

function shutdown(signal) {
  if (process) {
    process.close();
  }
  Deno.exit(0);
}

try {
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

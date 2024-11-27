try {
  const process = Deno.run({
    cmd: [
      "deno",
      "task",
      "-q",
      "--config",
      Deno.args.shift() + "/deno.jsonc",
      `viva`,
      ...Deno.args,
    ],
  });
  await process.status();
} catch (error) {
  console.error("[ERROR] in viva execution:");
  console.error(error);
}

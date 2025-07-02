#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

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
  console.error("@clients/shell [ERROR] in viva execution:");
  console.error(error);
}

import config from "@vivalence/config";

export default function cleanupPorts(daemon) {
  (async () => {
    const port = config.env.DAEMON_PORT;
    const p = Deno.run({ cmd: ["lsof", "-i", `:${port}`, "-t"], stdout: "piped", stderr: "piped" });
    const output = await p.output();
    const errors = await p.stderrOutput();
    p.close();
    if (errors.length > 0) {
      console.error("Kill error");
      console.error(new TextDecoder().decode(errors));
      return;
    }
    const pids = new TextDecoder().decode(output).trim().split("\n").filter(Boolean);
    for (const pid of pids) {
      console.log(`Killing process ${pid} on port ${port}`);
      const kill = Deno.run({ cmd: ["kill", "-9", pid] });
      await kill.status();
      console.log("Killed", pid, kill);
      kill.close();
    }
  })();
  return daemon;
}

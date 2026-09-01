import paladin from "@vivalence/paladin";
import { register, until } from "./target.js";

export async function start(ctx) {
  const instance = await register();
  const held = await paladin.ledger.lock(instance).read();
  if (held) throw new Error(`${instance} already running (supervisor ${held.pid}) — viva instance/stop`);

  const target = ctx.signal.params[0];
  const mount = paladin.instance.home.absolute;
  const supervisor = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--config",
      `${paladin.scope.repository.absolute}/deno.jsonc`,
      "-A",
      new URL("../../mod.js", import.meta.url).pathname,
      "instance/run",
      ...(target ? [target] : []),
      `--instance=${mount}`,
      "--logged",
    ],
    detached: true,
    stdin: "null",
    stdout: "null",
    stderr: "null",
  }).spawn();
  supervisor.unref();

  const logs = paladin.scope.ledger.branch(`logs/${instance}`).absolute;
  const settled = await Promise.race([
    until(async () => {
      const lock = await paladin.ledger.lock(instance).read();
      return lock?.status === "ALIVE" ? lock : null;
    }, 60_000),
    supervisor.status.then((exit) => ({ exit })),
  ]);
  if (settled?.exit) {
    throw new Error(`${instance}: supervisor ${supervisor.pid} exited ${settled.exit.code} — see ${logs}`);
  }
  if (!settled) throw new Error(`${instance}: not alive after 60 s (supervisor ${supervisor.pid}) — see ${logs}`);

  console.log(
    `ghost: started ${instance} (supervisor ${supervisor.pid}: ${settled.processes.map((held) => `${held.process}=${held.pid}`).join(", ")})`,
  );
  console.log(`ghost: stop with: viva instance/stop`);
  ctx.effect = { status: "started", instance, supervisor: supervisor.pid, processes: settled.processes, logs };
}

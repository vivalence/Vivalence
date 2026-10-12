import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { register, until } from "../../../gestalten/belt/instance.js";

async function effect(ctx) {
  const instance = await register();
  const held = await paladin.ledger.lock(instance).read();
  if (held) throw new Error(`${instance} already running (supervisor ${held.pid}) — viva instance/stop`);

  const target = ctx.signal.body[0];
  const mount = paladin.instance.home.absolute;
  const supervisor = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--config",
      `${paladin.scope.repository.absolute}/deno.jsonc`,
      "-A",
      new URL("../../../run.js", import.meta.url).pathname,
      "instance/up",
      ...(target ? [target] : []),
      `--instance=${mount}`,
      "--logged",
      ...(ctx.signal.flags.prune === true ? ["--prune"] : []),
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
  return { status: "started", instance, supervisor: supervisor.pid, processes: settled.processes, logs };
}

export const start = new Vector().open(
  {
    nature: "/instance/start",
    valence: "start the mounted instance detached — a supervisor ghost runs it logged (instance/up --logged) and holds the lock; no chrome. Example: viva instance/start runtime",
    schema: v.object({
      process: v.string().desc("runtime | anima | all. Example: runtime").optional(),
      prune: v.boolean().desc("drop datamap rows of daemons no longer in instance.viva.json (VIVA_RUNTIME_PRUNE=1)").group("flags").optional(),
    }),
  },
  effect,
);

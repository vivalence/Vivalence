import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { instance } from "../belt/index.js";

async function effect(ctx) {
  const slug = await instance.register();
  const held = await paladin.ledger.lock(slug).read();
  if (held) throw new Error(`${slug} already running (supervisor ${held.pid}) — viva instance/stop`);

  const target = ctx.signal.body[0];
  const home = paladin.instance.home.absolute;
  const repository = paladin.scope.repository.absolute;
  const supervisor = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--config",
      `${repository}/deno.jsonc`,
      "-A",
      `${repository}/systems/ghost/run.js`,
      "instance/up",
      ...(target ? [target] : []),
      `--instance=${home}`,
      "--logged",
      ...(ctx.signal.flags.prune === true ? ["--prune"] : []),
    ],
    detached: true,
    stdin: "null",
    stdout: "null",
    stderr: "null",
  }).spawn();
  supervisor.unref();

  const logs = paladin.scope.ledger.branch(`logs/${slug}`).absolute;
  const settled = await Promise.race([
    instance.until(async () => {
      const lock = await paladin.ledger.lock(slug).read();
      return lock?.status === "ALIVE" ? lock : null;
    }, 60_000),
    supervisor.status.then((exit) => ({ exit })),
  ]);
  if (settled?.exit) throw new Error(`${slug}: supervisor ${supervisor.pid} exited ${settled.exit.code} — see ${logs}`);
  if (!settled) throw new Error(`${slug}: not alive after 60 s (supervisor ${supervisor.pid}) — see ${logs}`);

  return { status: "started", instance: slug, supervisor: supervisor.pid, processes: settled.processes, logs, next: "viva instance/stop" };
}

export const start = new Vector().open(
  {
    nature: "/instance/start",
    valence: "start the mounted instance detached — a supervisor ghost runs it logged (instance/up --logged) and holds the lock; no chrome. Example: viva instance/start runtime",
    input: v.object({
      process: v.string().desc("runtime | anima | all. Example: runtime").optional(),
      prune: v.boolean().desc("drop datamap rows of daemons no longer in instance.viva.json (VIVA_RUNTIME_PRUNE=1)").group("flags").optional(),
    }),
  },
  effect,
);

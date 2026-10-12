import paladin, { lifecycle } from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { register, specs } from "../../../gestalten/belt/instance.js";

const SIGNALS = { 129: "SIGHUP", 130: "SIGINT", 131: "SIGQUIT", 137: "SIGKILL", 143: "SIGTERM" };

async function effect(ctx) {
  const instance = await register();
  await lifecycle.mount(paladin.instance);
  if (ctx.signal.flags.prune === true) Deno.env.set("VIVA_RUNTIME_PRUNE", "1");
  const attachment = ctx.signal.flags.logged === true ? "logged" : "inherit";
  const die = await paladin.ledger.boot(specs(ctx.signal.body[0]), { instance, attachment });

  for (const process of die.good.processes) {
    const branch = ctx.span?.branch(`run/${process.slug}`).open();
    branch?.mark("subject", { schema: "process", id: String(process.child.pid) });
    process.perpetuate().then((exit) => {
      if (!exit.success) branch?.fault({ message: `exit ${exit.code}`, code: "EXIT" });
      branch?.close();
    });
  }

  await die.integrate();
  console.log(`run ${die.good.processes.map((process) => `${process.slug}=${process.child.pid}`).join(" ")}`);

  const { exits, signal } = await die.perpetuate();
  const children = die.good.processes.map((process, at) => {
    const exit = exits[at];
    return {
      process: process.slug,
      success: exit.success,
      code: exit.code,
      signal: exit.signal ?? SIGNALS[exit.code] ?? null,
    };
  });
  const failed = signal ? [] : children.filter((child) => !child.success);
  const ran = {
    status: signal ? "stopped" : failed.length ? "failed" : "ran",
    instance,
    ...(signal ? { signal } : {}),
    children,
  };
  if (failed.length) {
    throw new Error(`instance: ${failed.map((child) => `${child.process} exited ${child.code}`).join(", ")}`);
  }
  return ran;
}

export const up = new Vector().open(
  {
    nature: "/instance/up",
    valence: "run the mounted instance attached — runtime and anima, or a space-separated subset; exit 1 iff a child exits non-zero; --logged sends their output to <ledger>/logs/<slug>/. Example: viva instance/up runtime",
    schema: v.object({
      process: v.string().desc("runtime | anima | all. Example: all").optional(),
      logged: v.boolean().desc("write child output to the ledger's logs instead of the terminal").group("flags").optional(),
      prune: v.boolean().desc("drop datamap rows of daemons no longer in instance.viva.json (VIVA_RUNTIME_PRUNE=1)").group("flags").optional(),
    }),
  },
  effect,
);

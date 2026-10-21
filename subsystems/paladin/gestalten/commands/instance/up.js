import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import { instance } from "../belt/index.js";

const SIGNALS = { 129: "SIGHUP", 130: "SIGINT", 131: "SIGQUIT", 137: "SIGKILL", 143: "SIGTERM" };

async function supervise(ctx, slug, attachment) {
  const die = await paladin.ledger.boot(instance.specs(ctx.signal.body[0]), { instance: slug, attachment });

  for (const process of die.good.processes) {
    const span = ctx.controller.stdout.branch(`run/${process.slug}`);
    span.start();
    span.entity({ schema: "process", id: String(process.child.pid) });
    process.perpetuate().then((exit) => {
      if (!exit.success) span.fault(new Error(`exit ${exit.code}`));
      span.stop();
    });
  }

  await die.integrate();

  const { exits, signal } = await die.perpetuate();
  const children = die.good.processes.map((process, at) => ({
    process: process.slug,
    success: exits[at].success,
    code: exits[at].code,
    signal: exits[at].signal ?? SIGNALS[exits[at].code] ?? null,
  }));
  const failed = signal ? [] : children.filter((child) => !child.success);
  if (failed.length) throw new Error(`instance: ${failed.map((child) => `${child.process} exited ${child.code}`).join(", ")}`);
  return { status: signal ? "stopped" : "ran", instance: slug, ...(signal ? { signal } : {}), children };
}

async function effect(ctx) {
  const slug = await instance.register();
  await mount(paladin.instance);
  if (ctx.signal.flags.prune === true) Deno.env.set("VIVA_RUNTIME_PRUNE", "1");
  const attachment = ctx.signal.flags.logged === true ? "logged" : "inherit";
  try {
    return await supervise(ctx, slug, attachment);
  } catch (error) {
    if (attachment === "logged") {
      const file = await paladin.ledger.log(slug).open("supervisor", "out");
      await file.write(new TextEncoder().encode(`${error.stack}\n`));
      file.close();
    }
    throw error;
  }
}

export const up = new Vector().open(
  {
    nature: "/instance/up",
    valence: "run the mounted instance attached — runtime and anima, or a space-separated subset; exit 1 iff a child exits non-zero; --logged sends their output to <ledger>/logs/<slug>/. Example: viva instance/up runtime",
    input: v.object({
      process: v.string().desc("runtime | anima | all. Example: all").optional(),
      logged: v.boolean().desc("write child output to the ledger's logs instead of the terminal").group("flags").optional(),
      prune: v.boolean().desc("drop datamap rows of daemons no longer in instance.viva.json (VIVA_RUNTIME_PRUNE=1)").group("flags").optional(),
    }),
  },
  effect,
);

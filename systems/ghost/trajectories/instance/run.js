import paladin from "@vivalence/paladin";
import { register, specs } from "./target.js";

const SIGNALS = { 129: "SIGHUP", 130: "SIGINT", 131: "SIGQUIT", 137: "SIGKILL", 143: "SIGTERM" };

export async function run(ctx) {
  const instance = await register();
  const attachment = ctx.signal.flags?.logged === true ? "logged" : "inherit";
  const die = await paladin.ledger.boot(specs(ctx.signal.params[0]), { instance, attachment });

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
  ctx.effect = {
    status: signal ? "stopped" : failed.length ? "failed" : "ran",
    instance,
    ...(signal ? { signal } : {}),
    children,
  };
  if (failed.length) {
    throw new Error(`instance: ${failed.map((child) => `${child.process} exited ${child.code}`).join(", ")}`);
  }
}

import paladin from "@vivalence/paladin";
import { register, specs } from "./target.js";

export async function start(ctx) {
  const slug = await register();
  const chosen = specs(ctx.signal.params[0], { attachment: "detached", instance: slug });

  for (const spec of chosen) {
    if (await paladin.ledger.lock(spec.instance, spec.process).alive()) {
      throw new Error(`${spec.instance}:${spec.process} already running`);
    }
    await paladin.ledger.lock(spec.instance, spec.process).remove();
  }

  const processes = await Promise.all(chosen.map((spec) => paladin.ledger.spawn(spec)));

  console.log(
    `ghost: started ${slug} (${processes
      .map((process) => `${process.spec.process}=${process.pid}`)
      .join(", ")})`,
  );
  console.log(`ghost: stop with: viva /instance/stop`);

  ctx.effect = {
    status: "started",
    slug,
    pids: processes.map((process) => ({ process: process.spec.process, pid: process.pid })),
  };
}

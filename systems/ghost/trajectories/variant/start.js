import paladin from "@vivalence/paladin";
import { register, specs } from "./target.js";

export async function start(ctx) {
  const chosen = specs(ctx.signal.params[0], { attachment: "detached" });

  for (const spec of chosen) {
    if (await paladin.ledger.lock(spec.instance, spec.process).alive()) {
      throw new Error(`${spec.instance}:${spec.process} already running`);
    }
    await paladin.ledger.lock(spec.instance, spec.process).remove();
  }

  const processes = await Promise.all(chosen.map((spec) => paladin.ledger.spawn(spec)));
  await register();
  const slug = processes[0]?.spec.slug;

  console.log(
    `ghost: started ${slug} (${processes
      .map((process) => `${process.spec.type}=${process.pid}`)
      .join(", ")})`,
  );
  console.log(`ghost: stop with: viva /variant/stop`);

  ctx.effect = {
    status: "started",
    slug,
    pids: processes.map((process) => ({ type: process.spec.type, pid: process.pid })),
  };
}

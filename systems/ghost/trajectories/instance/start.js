import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

export async function start(ctx) {
  const chosen = specs(ctx.signal.params[0], { attachment: "detached" });

  // dedup: refuse if a live lock exists; sweep stale locks
  for (const spec of chosen) {
    if (await paladin.system.lock(spec.instance, spec.process).alive()) {
      throw new Error(`${spec.instance}:${spec.process} already running`);
    }
    await paladin.system.lock(spec.instance, spec.process).remove();
  }

  const processes = await Promise.all(chosen.map((spec) => paladin.system.spawn(spec)));
  const slug = processes[0]?.spec.slug;

  console.log(
    `ghost: started ${slug} (${processes
      .map((process) => `${process.spec.type}=${process.pid}`)
      .join(", ")})`,
  );
  console.log(`ghost: stop with: viva /instance/stop`);

  ctx.effect = {
    status: "started",
    slug,
    pids: processes.map((process) => ({ type: process.spec.type, pid: process.pid })),
  };
}

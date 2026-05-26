import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

export async function start(ctx) {
  const chosen = specs(ctx.signal.params[0], { detached: true });
  console.log(`ghost: chosen (${chosen.map((spec) => `${spec.type}_${spec.slug}`).join(", ")})`);

  for (const spec of chosen) {
    if (await paladin.system.lock(spec.type, spec.slug).alive()) {
      throw new Error(`${spec.slug}:${spec.type} already running`);
    }
    await paladin.system.lock(spec.type, spec.slug).remove();
  }

  const processes = await Promise.all(chosen.map((spec) => paladin.system.spawn(spec)));
  const slug = processes[0]?.spec.slug;

  console.log(
    `ghost: started ${slug} (${processes.map((process) => `${process.spec.type}=${process.pid}`).join(", ")})`,
  );
  console.log(`ghost: stop with: viva instance/stop`);

  ctx.effect = {
    status: "started",
    slug,
    pids: processes.map((process) => ({ type: process.spec.type, pid: process.pid })),
  };
}

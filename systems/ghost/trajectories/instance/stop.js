import paladin from "@vivalence/paladin";
import { resolveTarget } from "./target.js";

export async function stop(ctx) {
  const { signal } = ctx;
  const [target] = signal.params;
  const { slug } = await resolveTarget(target);

  const locks = await paladin.system.locks.list(slug);
  if (!locks.length) {
    console.log(`ghost: ${slug} not running`);
    ctx.effect = { status: "nothing-to-stop", slug };
    return;
  }

  const killed = [];
  for (const lock of locks) {
    try {
      Deno.kill(lock.pid, "SIGTERM");
      killed.push({ process: lock.process, pid: lock.pid, signal: "SIGTERM" });
    } catch (error) {
      killed.push({ process: lock.process, pid: lock.pid, error: error.message });
    }
    await paladin.system.locks.remove(slug, lock.process);
  }

  console.log(`ghost: stopped ${slug} (${killed.map((k) => `${k.process}=${k.pid}`).join(", ")})`);
  ctx.effect = { status: "stopped", slug, killed };
}

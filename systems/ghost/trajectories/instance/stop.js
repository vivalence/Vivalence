import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

export async function stop(ctx) {
  const chosen = specs(ctx.signal.params[0]);
  const slug = chosen[0]?.slug;

  const killed = [];
  for (const spec of chosen) {
    const pid = await paladin.system.kill(spec.type, spec.slug);
    if (pid !== null) killed.push({ type: spec.type, pid });
  }

  console.log(
    killed.length
      ? `ghost: stopped ${slug} (${killed.map((entry) => `${entry.type}=${entry.pid}`).join(", ")})`
      : `ghost: ${slug} not running`,
  );

  ctx.effect = { status: killed.length ? "stopped" : "nothing-to-stop", slug, killed: killed.length };
}

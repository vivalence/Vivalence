import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

export async function stop(ctx) {
  const chosen = specs(ctx.signal.params[0]);
  const instance = chosen[0]?.instance;

  const killed = [];
  for (const spec of chosen) {
    const pid = await paladin.ledger.kill(spec.instance, spec.process);
    if (pid !== null) killed.push({ process: spec.process, pid });
  }

  console.log(
    killed.length
      ? `ghost: stopped ${instance} (${killed.map((entry) => `${entry.process}=${entry.pid}`).join(", ")})`
      : `ghost: ${instance} not running`,
  );

  ctx.effect = { status: killed.length ? "stopped" : "nothing-to-stop", instance, killed: killed.length };
}

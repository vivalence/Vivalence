import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

export async function run(ctx) {
  const processes = await paladin.ledger.boot(specs(ctx.signal.params[0]));

  for (const process of processes) {
    const branch = ctx.span?.branch(`run/${process.spec.type}`).begin();
    branch?.track.subject({ schema: "process", id: String(process.pid) });
    process.status.then((exit) => {
      if (!exit.success) branch?.track.fault().raise(`exit ${exit.code}`, "EXIT");
      branch?.seal();
    });
  }

  console.log(`run ${processes.map((process) => `${process.spec.type}=${process.pid}`).join(" ")}`);

  const children = await Promise.all(
    processes.map(async (process) => ({ type: process.spec.type, ...(await process.status) })),
  );
  ctx.effect = { status: "ran", slug: processes[0]?.spec.slug, children };
}

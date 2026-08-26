import paladin from "@vivalence/paladin";
import { register, specs } from "./target.js";

export async function run(ctx) {
  const slug = await register();
  const processes = await paladin.ledger.boot(specs(ctx.signal.params[0], { instance: slug }));

  for (const process of processes) {
    const branch = ctx.span?.branch(`run/${process.spec.process}`).open();
    branch?.mark("subject", { schema: "process", id: String(process.pid) });
    process.status.then((exit) => {
      if (!exit.success) branch?.fault({ message: `exit ${exit.code}`, code: "EXIT" });
      branch?.close();
    });
  }

  console.log(`run ${processes.map((process) => `${process.spec.process}=${process.pid}`).join(" ")}`);

  const children = await Promise.all(
    processes.map(async (process) => ({ process: process.spec.process, ...(await process.status) })),
  );
  ctx.effect = { status: "ran", instance: processes[0]?.spec.instance, children };
}

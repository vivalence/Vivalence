import paladin from "@vivalence/paladin";
import { specs } from "./target.js";

const encoder = new TextEncoder();

export async function run(ctx) {
  const { signal, span } = ctx;
  const processes = await Promise.all(specs(signal.params[0]).map((spec) => paladin.system.spawn(spec)));

  const branches = new Map();
  for (const process of processes) {
    const { type, slug } = process.spec;
    const log = paladin.system.log(type, slug);
    const out = await log.open("out");
    const err = await log.open("err");

    process.out.tap((line) => out.write(encoder.encode(line + "\n")));
    process.err.tap((line) => err.write(encoder.encode(line + "\n")));

    const branch = span?.branch(`run.${type}`).begin();
    branch?.track.subject({ schema: "process", id: String(process.pid) });
    branches.set(process, branch);
  }

  const slug = processes[0]?.spec.slug;
  console.log(
    `ghost: running ${slug} (${processes.map((process) => `${process.spec.type}=${process.pid}`).join(", ")})`,
  );

  const children = await Promise.all(
    processes.map(async (process) => {
      const status = await process.status;
      const branch = branches.get(process);
      if (!status.success) branch?.track.fault().raise(`exit ${status.code}`, "EXIT");
      branch?.seal();
      return { type: process.spec.type, ...status };
    }),
  );

  ctx.effect = { status: "ran", slug, children };
}

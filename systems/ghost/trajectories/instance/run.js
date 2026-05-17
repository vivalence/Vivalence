import paladin from "@vivalence/paladin";
import { resolveTarget, CHILDREN } from "./target.js";

export async function run(ctx) {
  const { signal, span } = ctx;
  const [target] = signal.params;
  const { slug, mount } = await resolveTarget(target);

  const repository = paladin.env.get("VIVA_REPOSITORY_MOUNT");

  const spawned = await Promise.all(
    CHILDREN.map((definition) => spawn({ slug, mount, repository, span, ...definition })),
  );

  const teardown = async (reason) => {
    console.error(`\nghost: ${reason} — terminating children`);
    for (const { process, child } of spawned) {
      try {
        child.kill("SIGTERM");
      } catch {}
      await paladin.system.locks.remove(slug, process);
    }
  };

  const interrupt = () => teardown("SIGINT").then(() => Deno.exit(130));
  Deno.addSignalListener("SIGINT", interrupt);

  console.log(
    `ghost: running ${slug} (${spawned.map((s) => `${s.process}=${s.child.pid}`).join(", ")})`,
  );
  console.log(`ghost: logs at ${paladin.scope.system.absolute}/logs/${slug}/`);

  const statuses = await Promise.all(
    spawned.map(async ({ process, child }) => {
      const status = await child.status;
      await paladin.system.locks.remove(slug, process);
      return { process, code: status.code, success: status.success };
    }),
  );

  Deno.removeSignalListener("SIGINT", interrupt);

  ctx.effect = { status: "ran", slug, mount, children: statuses };
}

async function spawn({ slug, process, task, mount, repository, span }) {
  const outLog = await paladin.system.logs.open(slug, process, "out");
  const errLog = await paladin.system.logs.open(slug, process, "err");

  const child = new Deno.Command("deno", {
    args: ["task", "--config", repository + "/deno.jsonc", "-q", task],
    env: {
      ...Deno.env.toObject(),
      VIVA_VARIANT_MOUNT: mount,
    },
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  child.stdout.pipeTo(outLog.writable).catch(() => {}); // @beef dont catch quityly. at least log.
  child.stderr.pipeTo(errLog.writable).catch(() => {});

  await paladin.system.locks.write(slug, process, {
    pid: child.pid,
    started: new Date().toISOString(),
    mount,
    process,
    task,
  });

  span
    ?.branch(`run.${process}`)
    .begin()
    .track.subject({ schema: "process", id: String(child.pid) });

  return { process, child };
}

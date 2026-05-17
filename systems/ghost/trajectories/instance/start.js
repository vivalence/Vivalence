import paladin from "@vivalence/paladin";
import { resolveTarget, CHILDREN } from "./target.js";

export async function start(ctx) {
  const { signal, span } = ctx;
  const [target] = signal.params;
  const { slug, mount } = await resolveTarget(target);

  const existing = await paladin.system.locks.list(slug);
  for (const lock of existing) {
    if (await paladin.system.locks.alive(slug, lock.process)) {
      throw new Error(`${slug}:${lock.process} already running (pid ${lock.pid})`);
    }
    await paladin.system.locks.remove(slug, lock.process);
  }

  const repository = paladin.env.get("VIVA_REPOSITORY_MOUNT");

  const spawned = await Promise.all(
    CHILDREN.map((definition) => spawnDetached({ slug, mount, repository, span, ...definition })),
  );

  console.log(`ghost: started ${slug} (${spawned.map((s) => `${s.process}=${s.pid}`).join(", ")})`);
  console.log(`ghost: logs at ${paladin.scope.system.absolute}/logs/${slug}/`);
  console.log(`ghost: stop with: viva instance/stop ${slug}`);

  ctx.effect = { status: "started", slug, mount, pids: spawned };
}

async function spawnDetached({ slug, process, task, mount, repository, span }) {
  const outLog = await paladin.system.logs.open(slug, process, "out");
  const errLog = await paladin.system.logs.open(slug, process, "err");

  const child = new Deno.Command("deno", {
    // @beef here is a the problem why the repository home must be written to env prior to ghost working.
    // how do install wizards work? whats the propper way to install software like this??!!
    // gui/consumer perspective and terminal/consumer and terminal/developer perspectives

    args: ["task", "--config", repository + "/deno.jsonc", "-q", task],
    env: { ...Deno.env.toObject(), VIVA_VARIANT_MOUNT: mount },
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  child.stdout.pipeTo(outLog.writable).catch(() => {});
  child.stderr.pipeTo(errLog.writable).catch(() => {});

  await paladin.system.locks.write(slug, process, {
    pid: child.pid,
    started: new Date().toISOString(),
    mount,
    process,
    task,
  });

  span
    ?.branch(`start.${process}`)
    .begin()
    .track.subject({ schema: "process", id: String(child.pid) });

  child.unref();
  return { process, pid: child.pid };
}

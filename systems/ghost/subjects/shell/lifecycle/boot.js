import paladin from "@vivalence/paladin";
import { Connection, Url, object } from "@vivalence/typology";

const INHERITED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];
const carried = (key) => INHERITED.includes(key) || (/^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_/.test(key) && key !== "VIVA_PROCESS_ID");

const specs = (instance) => {
  const mount = instance.home.absolute;
  const repository = paladin.scope.repository.absolute;
  return [
    {
      identity: { process: "runtime", mount },
      serve: instance.runtime.statics.serve.absolute,
      command: {
        bin: Deno.execPath(),
        args: ["run", "-A", "--config", `${repository}/deno.jsonc`, `${repository}/systems/runtime/run.js`],
        cwd: mount,
        env: { ...object.filter(Deno.env.toObject(), carried), VIVA_INSTANCE_MOUNT: mount, VIVA_LEDGER_MOUNT: paladin.scope.ledger.absolute, VIVA_REPOSITORY_MOUNT: repository },
      },
    },
  ];
};

const status = (remote) => new Connection(remote).call("/status").then((held) => held, () => null);

const reached = async (remote) => {
  let held = await status(remote);
  while (held !== null && held.code === "IDLE") {
    console.warn(`[runtime] ${remote.absolute} ${held.code} — booting, waiting`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    held = await status(remote);
  }
  if (held === null) return false;
  if (held.code !== "RUNNING") throw new Error(`runtime ${remote.absolute} is ${held.code} — not this client's to start`);
  return true;
};

export const boot = async (shellDie, next) => {
  const remote = new Url(shellDie.instance.runtime.statics.remote);
  let booted = null;
  if (!(await reached(remote))) {
    const held = await paladin.ledger.instances.lookup(shellDie.instance.home.absolute);
    if (held === null) throw new Error(`runtime ${remote.absolute} unreachable, and ${shellDie.instance.home.absolute} is no instance of this ledger — not this machine's to start`);
    shellDie.controller.stdout.log({ booting: held.slug, log: paladin.scope.ledger.branch(`logs/${held.slug}/runtime.out.log`).absolute });
    console.warn(`[runtime] starting ${held.slug} @ ${remote.absolute} — log ${paladin.scope.ledger.branch(`logs/${held.slug}/runtime.out.log`).absolute}`);
    const since = performance.now();
    const elapsed = () => `${((performance.now() - since) / 1000).toFixed(1)}s`;
    booted = await paladin.ledger.boot(specs(shellDie.instance), { instance: held.slug, attachment: "logged" });
    booted.good.processes[0].out.tap((record) => {
      const subject = record.match(/^\[runtime\/[^/\]]+((?:\/[^/\]]+){0,2})\] (start|stop|fault)\b/);
      if (subject) console.warn(`[runtime] ${elapsed()} ${subject[1] || "/runtime"} ${subject[2]}`);
    });
    await booted.integrate();
    console.warn(`[runtime] started ${held.slug} @ ${remote.absolute}`);
  }
  try {
    await next();
  } finally {
    if (booted !== null) await booted.disintegrate();
  }
};

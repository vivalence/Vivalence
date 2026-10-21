import paladin from "@vivalence/paladin";
import { Connection, Url } from "@vivalence/typology";

const status = (remote) =>
  new Connection(remote).call("/status").then(
    (held) => held,
    () => null,
  );

const reached = async (remote) => {
  let held = await status(remote);
  while (held?.code === "IDLE") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    held = await status(remote);
  }
  if (held === null) return false;
  if (held.code !== "RUNNING")
    throw new Error(`runtime ${remote.absolute} is ${held.code} — not this client's to start`);
  return true;
};

export const runtime = async (shellDie, next) => {
  const remote = new Url(shellDie.instance.runtime.statics.remote);

  if (await reached(remote)) return next();

  const held = await paladin.ledger.instances.lookup(shellDie.instance.home.absolute);

  if (held === null)
    throw new Error(
      `runtime ${remote.absolute} unreachable, and ${shellDie.instance.home.absolute} is no instance of this ledger — not this machine's to start`,
    );

  shellDie.controller.stdout.log({
    booting: held.slug,
    log: paladin.ledger.log(held.slug).base.branch("runtime.out.log").absolute,
  });

  const booted = await paladin.ledger.boot(shellDie.instance.specs("runtime"), {
    instance: held.slug,
    attachment: "logged",
  });

  try {
    await booted.integrate();
    await next();
  } finally {
    await booted.disintegrate();
  }
};

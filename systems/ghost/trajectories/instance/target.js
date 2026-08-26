import paladin from "@vivalence/paladin";

const CHILDREN = {
  runtime: { task: "runtime/run" },
  kajuit: { task: "kajuit/watch" },
};

export async function register() {
  const mount = paladin.scope.instance.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) {
    throw new Error(`instance: mount not registered — viva instances/tap ${mount} --slug=<slug>`);
  }
  await paladin.ledger.instances.write(held.slug, { mount });
  return held.slug;
}

export function specs(param, { attachment = "inherit", instance = null } = {}) {
  const target = param ?? "all";
  const known = ["all", ...Object.keys(CHILDREN)];
  if (!known.includes(target)) {
    throw new Error(`instance: unknown target '${target}' — expected ${known.join(" | ")}`);
  }

  if (!paladin.scope.instance) throw new Error("instance: no instance mounted — set VIVA_INSTANCE_MOUNT");

  const mount = paladin.scope.instance.absolute;
  const config = `${paladin.scope.repository.absolute}/deno.jsonc`;

  const chosen = target === "all" ? Object.keys(CHILDREN) : [target];
  return chosen.map((process) => ({
    process,
    instance,
    mount,
    attachment,
    cmd: ["deno", "task", "--config", config, "-q", CHILDREN[process].task],
    env: { VIVA_INSTANCE_MOUNT: mount },
  }));
}

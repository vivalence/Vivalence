import paladin from "@vivalence/paladin";
import { object } from "@vivalence/typology";
import { lens, pick } from "../../belt/index.js";

const CHILDREN = {
  runtime: { task: "runtime/run" },
  kajuit: { task: "kajuit/watch" },
};

const INHERITED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];
const carried = (key) =>
  INHERITED.includes(key) || (/^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_/.test(key) && key !== "VIVA_PROCESS_ID");

export async function locate(ctx, token) {
  if (token.includes("/") || token.startsWith(".")) {
    return { mount: (await paladin.ledger.instances.resolve(token)).mount };
  }
  const instances = await lens.instances();
  const chosen = instances.rows.length ? await pick(ctx, instances, token) : null;
  if (chosen?.aborted) return { aborted: true };
  if (!chosen) {
    return { error: `no instance '${token}' — viva instances/list, or viva instances/tap <path> --slug=${token}` };
  }
  return { mount: chosen.row.mount };
}

export async function register() {
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) {
    throw new Error(`instance: mount not registered — viva instances/tap ${mount} --slug=<slug>`);
  }
  await paladin.ledger.instances.write(held.slug, { mount });
  return held.slug;
}

export function specs(param) {
  const target = param ?? "all";
  const known = ["all", ...Object.keys(CHILDREN)];
  if (!known.includes(target)) {
    throw new Error(`instance: unknown target '${target}' — expected ${known.join(" | ")}`);
  }

  const mount = paladin.instance.home.absolute;
  const config = `${paladin.scope.repository.absolute}/deno.jsonc`;
  const env = {
    ...object.filter(Deno.env.toObject(), carried),
    VIVA_INSTANCE_MOUNT: mount,
    VIVA_LEDGER_MOUNT: paladin.scope.ledger.absolute,
    VIVA_REPOSITORY_MOUNT: paladin.scope.repository.absolute,
  };

  const chosen = target === "all" ? Object.keys(CHILDREN) : [target];
  return chosen.map((process) => ({
    identity: { process, mount },
    command: { bin: Deno.execPath(), args: ["task", "--config", config, "-q", CHILDREN[process].task], cwd: mount, env },
  }));
}

export async function until(check, deadline, every = 200) {
  const end = Date.now() + deadline;
  while (Date.now() < end) {
    const held = await check();
    if (held) return held;
    await new Promise((resolve) => setTimeout(resolve, every));
  }
  return null;
}

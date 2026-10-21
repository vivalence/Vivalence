import { Connection, object } from "@vivalence/typology";
import paladin from "../../../mod.js";
import * as lens from "./lens.js";
import { pick } from "./pick.js";

const CHILDREN = {
  runtime: {
    args: (repository) => ["run", "-A", "--config", `${repository}/deno.jsonc`, `${repository}/systems/runtime/run.js`],
    serve: (instance) => instance.runtime?.statics.serve,
  },
  anima: {
    args: (repository) => ["task", "--config", `${repository}/deno.jsonc`, "-q", "anima/watch"],
    serve: (instance) => instance.clients.find((client) => client.manifest.slug === "anima")?.statics.serve,
  },
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
  if (!chosen) return { error: `no instance '${token}' — viva ledger/doctor lists the shelf` };
  return { mount: chosen.row.mount };
}

export async function register() {
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) {
    throw new Error(`instance: mount ${mount} not recorded — viva instance/clone records one, viva instance/tap records a dir placed by hand`);
  }
  await paladin.ledger.instances.write(held.slug, { mount });
  return held.slug;
}

export function specs(param) {
  const target = param ?? "all";
  const known = ["all", ...Object.keys(CHILDREN)];
  if (!known.includes(target)) throw new Error(`instance: unknown target '${target}' — expected ${known.join(" | ")}`);

  const mount = paladin.instance.home.absolute;
  const repository = paladin.scope.repository.absolute;
  const env = {
    ...object.filter(Deno.env.toObject(), carried),
    VIVA_INSTANCE_MOUNT: mount,
    VIVA_LEDGER_MOUNT: paladin.scope.ledger.absolute,
    VIVA_REPOSITORY_MOUNT: repository,
  };

  const chosen = target === "all" ? Object.keys(CHILDREN) : [target];
  return chosen.map((process) => ({
    identity: { process, mount },
    serve: CHILDREN[process].serve(paladin.instance)?.absolute ?? null,
    command: { bin: Deno.execPath(), args: CHILDREN[process].args(repository), cwd: mount, env },
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

export const reached = (remote) => new Connection(remote).call("/status").then(() => true, () => false);

export const standing = { good: { processes: [] }, integrate: async () => {}, disintegrate: async () => {} };

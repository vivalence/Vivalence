import { Connection } from "@vivalence/typology";
import paladin from "../../../mod.js";
import * as lens from "./lens.js";
import { pick } from "./pick.js";

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
  const known = ["all", ...paladin.instance.processes];
  if (!known.includes(target)) throw new Error(`instance: unknown target '${target}' — expected ${known.join(" | ")}`);
  return paladin.instance.specs(...(target === "all" ? paladin.instance.processes : [target]));
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

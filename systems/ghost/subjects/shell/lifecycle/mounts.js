import { resolve } from "@std/path";
import * as dotenv from "@std/dotenv";
import paladin from "@vivalence/paladin";
import { is, object, Path } from "@vivalence/typology";

const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();

export const flagged = (key) => key.slice("VIVA_".length, -"_MOUNT".length).toLowerCase();

export const recipe = async (shellDie, next) => {
  const held = await Deno.stat(new Path(cwd()).branch("instance.viva.json").absolute).catch(() => null);
  if (held?.isFile && !paladin.env.get("VIVA_INSTANCE_MOUNT")) paladin.env.set("VIVA_INSTANCE_MOUNT", cwd(), "cwd");
  await next();
};

export const mounts = async (shellDie, next) => {
  for (const key of Object.keys(paladin.mounts.properties)) {
    const token = shellDie.signal.flags[flagged(key)];
    if (!is.string(token)) continue;
    const pinned = key === "VIVA_INSTANCE_MOUNT" ? (await paladin.ledger.instances.resolve(token)).mount : resolve(cwd(), token);
    paladin.env.set(key, pinned, "flag");
  }
  if (is.string(shellDie.signal.flags.env)) {
    const vars = await dotenv.load({ envPath: resolve(cwd(), shellDie.signal.flags.env) });
    const held = object.filter(vars, (key) => key.startsWith("VIVA_") || key.startsWith("PUBLIC_VIVA_"));
    const secrets = object.filter(vars, (key) => key.startsWith("SECRET_VIVA_"));
    if (!Object.keys(held).length && !Object.keys(secrets).length) throw new Error(`--env ${shellDie.signal.flags.env}: no VIVA_* knowledge in it`);
    paladin.env.assign(held, ".env");
    paladin.secret.assign(secrets, ".env");
  }
  await next();
};

import { join } from "@std/path";

import paladin from "@vivalence/paladin";

// --instance is VIVA_INSTANCE_MOUNT at the flag stratum: the key, shorn of VIVA_ and _MOUNT.
const flag = (key) => key.slice("VIVA_".length, -"_MOUNT".length).toLowerCase();

// a MOUNT is always a path; --instance alone also takes a slug, resolved against the record at the pinhole (mod.js).
const WIDENED = { instance: { shape: "<slug|path>", example: "vivalence" } };

export const mounts = Object.fromEntries(
  Object.entries(paladin.mounts.properties).map(([key, held]) => {
    const name = flag(key);
    return [name, { key, shape: "<path>", example: held.examples[0], ...WIDENED[name] }];
  }),
);

// the shell config is a .env that must keep its `export ` prefix — so it upserts here, by line,
// the same way paladin.state.env does for every other .env in the system.
export async function writeShellConfig(key, value) {
  const dir = join(Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"), "viva");
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });

  const held = await Deno.readTextFile(file).catch(() => "");
  const line = `export ${key}="${value}"`;
  const pattern = new RegExp(`^[ \\t]*export[ \\t]+${key}[ \\t]*=.*$`, "m");
  const text = pattern.test(held)
    ? held.replace(pattern, () => line)
    : `${held ? held.replace(/\n*$/, "\n") : ""}${line}\n`;

  await Deno.writeTextFile(file, text);
  return file;
}

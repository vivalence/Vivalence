import { join } from "@std/path";

export const MOUNTS = ["ledger", "repository", "registry", "instance", "mountpoint"];

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

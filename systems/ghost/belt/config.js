import { join } from "@std/path";

export const MOUNTS = ["ledger", "repository", "registry", "instance", "environment", "mountpoint"];

export async function writeShellConfig(key, value) {
  const dir = join(
    Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"),
    "viva",
  );
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });

  const existing = await Deno.readTextFile(file).catch(() => "");
  const lines = existing.split("\n").filter(Boolean);
  const line = `export ${key}="${value}"`;
  const index = lines.findIndex((entry) => entry.startsWith(`export ${key}=`));
  if (index >= 0) lines[index] = line;
  else lines.push(line);

  await Deno.writeTextFile(file, lines.join("\n") + "\n");
  return file;
}

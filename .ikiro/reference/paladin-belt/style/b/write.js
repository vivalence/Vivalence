import fs from "fs-extra";
import { dirname } from "@std/path";

const absolute = (path) => path.absolute ?? path;

export const text = async (path, text) => {
  const file = absolute(path);
  await fs.ensureDir(dirname(file));
  if ((await Deno.readTextFile(file).catch(() => null)) === text) return false;
  await Deno.writeTextFile(`${file}.tmp`, text);
  await Deno.rename(`${file}.tmp`, file);
  return true;
};

export const json = (path, data) => text(path, JSON.stringify(data, null, 2));

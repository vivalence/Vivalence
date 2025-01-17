import { walk } from "@std/fs";
import { basename, join } from "@std/path";
import { readAll } from "https://deno.land/std@0.161.0/streams/conversion.ts";

async function readTextFile(path) {
  const file = await Deno.open(path);
  const content = await readAll(file);
  file.close();
  return new TextDecoder().decode(content);
}

//  buildSchema(dirPath) {}
export default async function concat(dirPath) {
  const files = [];
  for await (const entry of walk(dirPath, { exts: [".prisma"] })) {
    if (entry.isFile) {
      files.push(entry.path);
    }
  }

  const fileContents = await Promise.all(
    files
      .sort(
        (a, b) =>
          (basename(a).startsWith("_") ? 1 : 0) - (basename(b).startsWith("_") ? 1 : 0) ||
          basename(a).localeCompare(basename(b)),
      )
      .map((file) => readTextFile(file)),
  );

  const file = fileContents.join("\n\n");

  return file;
}

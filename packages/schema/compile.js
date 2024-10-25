import config from "@vivalence/config";

import { walk } from "$std/fs/mod.ts";
import { basename, join } from "$std/path/mod.ts";
// import { readAll } from "$std/streams/conversion.ts";
import { readAll } from "https://deno.land/std@0.161.0/streams/conversion.ts";

async function readTextFile(path) {
  const file = await Deno.open(path);
  const content = await readAll(file);
  file.close();
  return new TextDecoder().decode(content);
}

async function buildSchema(dirPath) {
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

async function compile() {
  console.log("Compiling schema...");
  try {
    const root = config.env.get("SCHEMA_ROOT_DIR");
    const schemasDirectory = join(root, "./schema");
    const schema = await buildSchema(schemasDirectory);
    console.log("Schema built.");

    const schemaPath = join(root, "./schema.prisma");
    await Deno.writeTextFile(schemaPath, schema);
    console.log("Schema file written to disk.");

    const process = await Deno.run({
      cmd: ["deno", "run", "-A", "npm:prisma", "format", `--schema=${schemaPath}`],
    }).status();

    console.log("Schema compiled successfully.");

    console.log("Exiting...");
    Deno.exit(0);
  } catch (e) {
    console.error("[ERROR] Failed to compile schema.");
    console.error(e);
  }
}

await compile();

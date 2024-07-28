import { walk } from "$std/fs/mod.ts";
import { readAll } from "https://deno.land/std@0.161.0/streams/conversion.ts";
import { basename, join } from "$std/path/mod.ts";
import config from "@vivalence/config";

const __dirname = config.env.get("PRISMA_DIR");
const schemasDirectory = join(__dirname, "./schema");
const outputSchema = join(__dirname, "./schema.prisma");

async function concatenateSchemas() {
  async function readTextFile(path) {
    const file = await Deno.open(path);
    const content = await readAll(file);
    file.close();
    return new TextDecoder().decode(content);
  }

  async function writeTextFile(path, content) {
    await Deno.writeTextFile(path, content);
  }

  try {
    const files = [];
    for await (const entry of walk(schemasDirectory, { exts: [".prisma"] })) {
      if (entry.isFile) {
        files.push(entry.path);
      }
    }

    // const allowedFiles = ["0_app.prisma", "1_runtime.prisma", "2_corpus.prisma", "3_userland.prisma", "4_transient.prisma",];

    const schemaContents = await Promise.all(
      files
        .sort(
          (a, b) =>
            (basename(a).startsWith("_") ? 1 : 0) - (basename(b).startsWith("_") ? 1 : 0) ||
            basename(a).localeCompare(basename(b))
        )
        // .filter((file) => allowedFiles.includes(basename(file)))
        .map((file) => readTextFile(file))
    );

    const schemaContent = schemaContents.join("\n\n");
    await writeTextFile(outputSchema, schemaContent);
    console.log("Schema files concatenated successfully in alphabetical order.");
  } catch (err) {
    console.error("Error reading schema files:", err);
  }
}
await concatenateSchemas();

const process = await Deno.run({
  cmd: ["deno", "run", "-A", "npm:prisma", "format", `--schema=${outputSchema}`],
}).status();

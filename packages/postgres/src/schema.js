import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schemasDirectory = path.join(__dirname, "./schemas"); // Directory where your individual schema files are stored
const outputSchema = path.join(__dirname, "./schema.prisma"); // Path to the final schema file

async function concatenateSchemas() {
  throw new Error("Not allowed");
  try {
    const files = await fs.readdir(schemasDirectory);
    let schemaContent = "";

    for (const file of files) {
      if (file.endsWith(".prisma")) {
        const filePath = path.join(schemasDirectory, file);
        const content = await fs.readFile(filePath, "utf-8");
        schemaContent += content + "\n";
      }
    }

    await fs.writeFile(outputSchema, schemaContent);
    console.log("Schema files concatenated successfully.");
  } catch (err) {
    console.error("Error reading schema files:", err);
  }
}

await concatenateSchemas();

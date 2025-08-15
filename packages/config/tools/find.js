import fs from "@std/fs";
import { join } from "@std/path";

export default function find(config) {
  async function findVivaFiles(directory) {
    const files = [];

    const items = await fs.readdir(directory);

    for (const item of items) {
      const fullPath = join(directory, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const nestedFiles = await findVivaFiles(fullPath);
        files.push(...nestedFiles);
      } else if (item.endsWith(".viva.js")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  config.find = {
    files: { viva: findVivaFiles },
    // config: (path) => join(config.env.get("VIVA_CONFIG_DIR"), path),
  };
}

import fs from "@std/fs";

export default function state(config) {
  const resolve = (path) => (typeof path === "function" ? path() : path);

  const assertPath = async (path) => {
    const resolved = resolve(path);
    try {
      await fs.ensureDir(resolved);
      return null;
    } catch (error) {
      throw new Error(`Cannot create path: ${resolved}`);
    }
  };

  config.state = {
    dir: assertPath,
  };
}

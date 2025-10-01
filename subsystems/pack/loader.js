import { basename, dirname, fromFileUrl, join } from "$std/path/mod.ts";
import fs from "fs-extra";
import {
  resolveImportMap,
  resolveModuleSpecifier,
} from "https://deno.land/x/importmap@0.2.1/mod.ts";

const baseUrl = new URL(import.meta.url);

export default function cache({ importmap = { imports: {} } }) {
  const resolvedImportmap = resolveImportMap(importmap, baseUrl);

  return {
    name: "viva-loader",
    setup(build) {
      build.onResolve({ filter: /^@vivalence\// }, async (args) => {
        const mod = resolveModuleSpecifier(
          args.path,
          resolvedImportmap,
          baseUrl,
        );
        return { path: mod, namespace: "viva-loader" };
      });
      build.onLoad({ filter: /.*/, namespace: "viva-loader" }, async (args) => {
        const fileUrlObj = new URL(args.path);
        const contents = await fs.readFile(fileUrlObj.pathname);
        const resolveDir = dirname(fileUrlObj.pathname);
        // console.log(resolveDir, contents);
        return { resolveDir, contents, loader: "js" };
      });
    },
  };
}

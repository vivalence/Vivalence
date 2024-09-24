import { join, dirname } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const resolvers = [
  {
    test: (declaration) => declaration.startsWith("file:"),
    resolve: async (declaration, parentPath) => {
      const fullPath = join(dirname(parentPath), declaration.replace("file://", ""));
      if (!fullPath.endsWith(".viva.js")) {
        throw new Error(`Invalid module file: ${fullPath}. Must end with .viva.js`);
      }
      return fullPath;
    },
  },
];

function getResolver(declaration) {
  const resolver = resolvers.find((r) => r.test(declaration));
  if (!resolver) {
    throw new Error(`No resolver found for declaration: ${declaration}`);
  }
  return resolver.resolve;
}

async function importModule(path) {
  try {
    let module = await import(path);
    if (module.default) module = module.default;

    if (!module || !module.manifest) {
      throw new Error(`Invalid module structure at ${path}`);
    }
    // module.path = path; return module;
    return { ...module, path };
  } catch (error) {
    throw new Error(`Failed to import module at ${path}: ${error.message}`);
  }
}

function parseManifest(module) {
  const declarations = [];
  for (const depType in module.modules) {
    const depDeclarations = module.modules[depType];
    if (Array.isArray(depDeclarations)) {
      declarations.push(...depDeclarations);
    } else {
      declarations.push(depDeclarations);
    }
  }
  return declarations;
}

export { getResolver, importModule, parseManifest };

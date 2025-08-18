import { join, dirname } from "$std/path/mod.ts";
import { walk } from "$std/fs/mod.ts";
import { compare, satisfies } from "$std/semver/mod.ts";

const DEFAULT_OWNER = "@vivalence";
const registry = new Map();

const createModuleKey = (owner, type, slug, version = "") =>
  `${owner}/${type}/${slug}${version ? "@" + version : ""}`;

const parseModuleKey = (key) => {
  if (!key || typeof key !== "string") {
    throw new Error("Invalid module key: must be a non-empty string");
  }

  const cleanKey = key.trim().replace(/^\/+|\/+$/g, "");

  const hasOwnerPrefix = cleanKey.startsWith("@");
  const keyWithoutPrefix = hasOwnerPrefix ? cleanKey.slice(1) : cleanKey;

  const [pathPart, version = undefined] = keyWithoutPrefix.split("@");

  const parts = pathPart.split("/").filter(Boolean);

  if (hasOwnerPrefix) {
    if (parts.length < 3) {
      throw new Error(
        `Invalid module key format: ${key} - Expected @owner/type/slug[@version]`,
      );
    }
    return {
      owner: "@" + parts[0],
      type: parts[1],
      slug: parts[2],
      version,
    };
  } else {
    if (parts.length < 3) {
      throw new Error(
        `Invalid module key format: ${key} - Expected owner/type/slug[@version]`,
      );
    }
    return {
      owner: parts[0],
      type: parts[1],
      slug: parts[2],
      version,
    };
  }
};

const importModule = async (path) => {
  try {
    const moduleImport = await import(path);
    let module = moduleImport.default || moduleImport;
    if (!module?.manifest?.type || !module?.manifest?.slug) {
      throw new Error(`Invalid module manifest at ${path}`);
    }
    module.manifest.owner = module.manifest.owner || DEFAULT_OWNER;
    return module;
  } catch (error) {
    throw new Error(`Failed to import module at ${path}: ${error.message}`);
  }
};

const discover = async (dirPath) => {
  const modules = [];

  const matchingPaths = [];
  for await (const entry of walk(dirPath, {
    maxDepth: 5,
    includeFiles: true,
    includeDirs: false,
    match: [/\.viva\.js$/],
  })) {
    matchingPaths.push(entry.path);
  }

  const results = await Promise.all(
    matchingPaths.map(async (path) => {
      try {
        return await importModule(path);
      } catch (error) {
        console.warn(`Module discovery error: ${error.message}`);
        return null;
      }
    }),
  );

  modules.push(...results.filter(Boolean));

  return modules;
};

const buildRegistry = (modules) => {
  const newRegistry = new Map();
  modules.forEach((module) => {
    const { owner, type, slug, version } = module.manifest;

    if (!newRegistry.has(owner)) {
      newRegistry.set(owner, new Map());
    }
    const ownerMap = newRegistry.get(owner);

    if (!ownerMap.has(type)) {
      ownerMap.set(type, new Map());
    }
    const typeMap = ownerMap.get(type);

    if (!typeMap.has(slug)) {
      typeMap.set(slug, new Map());
    }
    const slugMap = typeMap.get(slug);

    slugMap.set(version, module);
  });
  return newRegistry;
};

const normalizeLookupQuery = (query) => {
  if (typeof query === "string") {
    return parseModuleKey(query);
  }

  return {
    owner: query.owner || DEFAULT_OWNER,
    type: query.type,
    slug: query.slug,
    version: query.version || undefined,
  };
};

export const lookup = (query) => {
  const { owner, type, slug, version } = normalizeLookupQuery(query);

  const ownerMap = registry.get(owner);
  if (!ownerMap) return null;

  const typeMap = ownerMap.get(type);
  if (!typeMap) return null;

  const slugMap = typeMap.get(slug);
  if (!slugMap) return null;

  if (!version) {
    const versions = Array.from(slugMap.keys());
    const highestVersion = versions.sort(compare)[0];
    return slugMap.get(highestVersion);
  }

  const versions = Array.from(slugMap.keys());
  const matchingVersion = versions.find((v) => satisfies(v, version));
  return matchingVersion ? slugMap.get(matchingVersion) : null;
};

export const init = async (config) => {
  const modules = await discover(config.register);
  registry.clear();

  const newRegistry = buildRegistry(modules);

  newRegistry.forEach((value, key) => {
    registry.set(key, value);
  });

  return registry;
};

export default { init, lookup };

// vendored from https://deno.land/x/importmap@0.2.1 (WICG import-maps resolve algorithm)
// trimmed to resolveImportMap + resolveModuleSpecifier, types stripped.

function isObject(object) {
  return typeof object == "object" && object !== null && object.constructor === Object;
}

function sortObject(normalized) {
  const sorted = {};
  const sortedKeys = Object.keys(normalized).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) sorted[key] = normalized[key];
  return sorted;
}

function isImportMap(importMap) {
  return (
    isObject(importMap) &&
    (importMap.imports !== undefined ? isImports(importMap.imports) : true) &&
    (importMap.scopes !== undefined ? isScopes(importMap.scopes) : true)
  );
}

function isImports(importsMap) {
  return isObject(importsMap);
}

function isScopes(scopes) {
  return isObject(scopes) && Object.values(scopes).every((value) => isSpecifierMap(value));
}

function isSpecifierMap(specifierMap) {
  return isObject(specifierMap);
}

function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function serializeURL(url) {
  return url.href;
}

function parseUrlLikeImportSpecifier(specifier, baseURL) {
  if (
    baseURL &&
    (specifier.startsWith("/") || specifier.startsWith("./") || specifier.startsWith("../"))
  ) {
    try {
      return new URL(specifier, baseURL);
    } catch {
      return null;
    }
  }
  try {
    return new URL(specifier);
  } catch {
    return null;
  }
}

function normalizeSpecifierKey(specifierKey, baseURL) {
  if (!specifierKey.length) {
    console.warn("specifier key cannot be an empty string.");
    return null;
  }
  const url = parseUrlLikeImportSpecifier(specifierKey, baseURL);
  if (url !== null) return serializeURL(url);
  return specifierKey;
}

function sortAndNormalizeSpecifierMap(originalMap, baseURL) {
  const normalized = {};
  for (const [specifierKey, value] of Object.entries(originalMap)) {
    const normalizedSpecifierKey = normalizeSpecifierKey(specifierKey, baseURL);
    if (normalizedSpecifierKey === null) continue;
    if (typeof value !== "string") {
      console.warn(`addresses need to be strings.`);
      normalized[normalizedSpecifierKey] = null;
      continue;
    }
    const addressURL = parseUrlLikeImportSpecifier(value, baseURL);
    if (addressURL === null) {
      console.warn(`the address was invalid.`);
      normalized[normalizedSpecifierKey] = null;
      continue;
    }
    if (specifierKey.endsWith("/") && !serializeURL(addressURL).endsWith("/")) {
      console.warn(
        `an invalid address was given for the specifier key specifierKey; since specifierKey ended in a slash, the address needs to as well.`,
      );
      normalized[normalizedSpecifierKey] = null;
      continue;
    }
    normalized[normalizedSpecifierKey] = serializeURL(addressURL);
  }
  return sortObject(normalized);
}

function sortAndNormalizeScopes(originalMap, baseURL) {
  const normalized = {};
  for (const [scopePrefix, potentialSpecifierMap] of Object.entries(originalMap)) {
    if (!isSpecifierMap(potentialSpecifierMap)) {
      throw new TypeError(`the value of the scope with prefix scopePrefix needs to be an object.`);
    }
    let scopePrefixURL;
    try {
      scopePrefixURL = new URL(scopePrefix, baseURL);
    } catch {
      console.warn(`the scope prefix URL was not parseable.`);
      continue;
    }
    const normalizedScopePrefix = serializeURL(scopePrefixURL);
    normalized[normalizedScopePrefix] = sortAndNormalizeSpecifierMap(potentialSpecifierMap, baseURL);
  }
  const sorted = {};
  for (const key of Object.keys(normalized)) sorted[key] = sortObject(normalized[key]);
  return sortObject(sorted);
}

const specialSchemes = ["ftp", "file", "http", "https", "ws", "wss"];

function isSpecial(asURL) {
  return specialSchemes.some((scheme) => serializeURL(asURL).startsWith(scheme));
}

function resolveImportsMatch(normalizedSpecifier, asURL, specifierMap) {
  for (const [specifierKey, resolutionResult] of Object.entries(specifierMap)) {
    if (specifierKey === normalizedSpecifier) {
      if (resolutionResult === null) {
        throw new TypeError(`resolution of specifierKey was blocked by a null entry.`);
      }
      if (!isURL(resolutionResult)) throw new TypeError(`resolutionResult must be an URL.`);
      return resolutionResult;
    } else if (
      specifierKey.endsWith("/") &&
      normalizedSpecifier.startsWith(specifierKey) &&
      (asURL === null || isSpecial(asURL))
    ) {
      if (resolutionResult === null) {
        throw new TypeError(`resolution of specifierKey was blocked by a null entry.`);
      }
      if (!isURL(resolutionResult)) throw new TypeError(`resolutionResult must be an URL.`);
      const afterPrefix = normalizedSpecifier.slice(specifierKey.length);
      if (!resolutionResult.endsWith("/")) {
        throw new TypeError(`resolutionResult does not end with "/"`);
      }
      try {
        const url = new URL(afterPrefix, resolutionResult);
        if (!isURL(url)) throw new TypeError(`url must be an URL.`);
        if (!serializeURL(url).startsWith(resolutionResult)) {
          throw new TypeError(
            `resolution of normalizedSpecifier was blocked due to it backtracking above its prefix specifierKey.`,
          );
        }
        return serializeURL(url);
      } catch {
        throw new TypeError(
          `resolution of normalizedSpecifier was blocked since the afterPrefix portion could not be URL-parsed relative to the resolutionResult mapped to by the specifierKey prefix.`,
        );
      }
    }
  }
  return null;
}

export function resolveImportMap(importMap, baseURL) {
  let sortedAndNormalizedImports = {};
  if (!isImportMap(importMap)) {
    throw new TypeError(`the top-level value needs to be a JSON object.`);
  }
  const { imports, scopes } = importMap;
  if (imports !== undefined) {
    if (!isImports(imports)) throw new TypeError(`"imports" top-level key needs to be an object.`);
    sortedAndNormalizedImports = sortAndNormalizeSpecifierMap(imports, baseURL);
  }
  let sortedAndNormalizedScopes = {};
  if (scopes !== undefined) {
    if (!isScopes(scopes)) throw new TypeError(`"scopes" top-level key needs to be an object.`);
    sortedAndNormalizedScopes = sortAndNormalizeScopes(scopes, baseURL);
  }
  if (Object.keys(importMap).find((key) => key !== "imports" && key !== "scopes")) {
    console.warn(`an invalid top-level key was present in the import map.`);
  }
  return { imports: sortedAndNormalizedImports, scopes: sortedAndNormalizedScopes };
}

export function resolveModuleSpecifier(specifier, { imports = {}, scopes = {} }, baseURL) {
  const baseURLString = serializeURL(baseURL);
  const asURL = parseUrlLikeImportSpecifier(specifier, baseURL);
  const normalizedSpecifier = asURL !== null ? serializeURL(asURL) : specifier;
  for (const [scopePrefix, scopeImports] of Object.entries(scopes)) {
    if (
      scopePrefix === baseURLString ||
      (scopePrefix.endsWith("/") && baseURLString.startsWith(scopePrefix))
    ) {
      const scopeImportsMatch = resolveImportsMatch(normalizedSpecifier, asURL, scopeImports);
      if (scopeImportsMatch !== null) return scopeImportsMatch;
    }
  }
  const topLevelImportsMatch = resolveImportsMatch(normalizedSpecifier, asURL, imports);
  if (topLevelImportsMatch !== null) return topLevelImportsMatch;
  if (asURL !== null) return serializeURL(asURL);
  throw new TypeError(`specifier was a bare specifier, but was not remapped to anything by importMap.`);
}

export default async function (config) {
  const rootDir = config.env.get("VIVA_REPO_ROOT_DIR");
  // i should have implemented path URL resolution at this point. env handles path computation and returns on all url types a new URL(). setup some reqex for the check.
  const importmap = JSON.parse(await Deno.readTextFile(rootDir + "/import_map.json"));

  config.repo = {
    root: rootDir,
    importmap: importmap.imports,
  };

  return config;
}

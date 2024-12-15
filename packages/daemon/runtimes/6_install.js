import { strings, array } from "@vivalence/shared";

export default async function install(daemon) {
  for (const runtime of daemon.runtimes.values()) {
    for (const module of [
      runtime,
      runtime.domain,
      runtime.ontology,
      ...runtime.corpora,
      ...runtime.games,
      ...runtime.tactics,
      ...runtime.strategies,
    ]) {
      if (module.manifest.installed) continue;

      if (typeof module.Module.install === "function") {
        module.manifest.installed = !!(await module.Module.install(runtime, module.Module));
      } else if (module.Module.curriculum) {
        module.manifest.installed = !!(await installCurriculum(runtime, module));
      } else if (module.manifest.id) {
        module.manifest.installed = true;
      }

      if (module.manifest.installed) success(module.manifest, runtime);
      else console.warn("NO Install happened on:", module.manifest);
    }
  }
  return daemon;
}

async function installCurriculum(runtime, module) {
  // might want to enforce tags->units->dependencies order.
  let curriculum = module.Module.curriculum;
  if (typeof curriculum === "function") curriculum = await curriculum(runtime, module.Module);

  const promises = [];
  for (const [key, resources] of Object.entries(curriculum)) {
    resources
      .map((resource) =>
        runtime.manifest.type === "corpus"
          ? { corpusId: module.manifest.id, ...resource }
          : resource,
      )
      .map((resource) => ({ [curriculumTypeMap[key]]: resource }))
      .map((resource) => () => runtime.call(`/${key}/install`, resource))
      .forEach((promise) => promises.push(promise));
  }

  // const installations = await Promise.all(promises);
  const installations = [];

  for (const chunk of array.chunk(promises, 20)) {
    // for (const promise of chunk) {
    await Promise.all(
      chunk.map(async (promise) => {
        try {
          const installation = await promise();
          console.log(
            "curriculum install:",
            installations.length,
            installation.status,
            installation.operation,
          );
          installations.push(installation);
        } catch (error) {
          console.error("Error installing curriculum", error);
          installations.push({ status: "error" });
        }
      }),
    );
  }
  console.log("installations ", installations.length, installations[0]);

  return installations.every(({ status }) => status === "success");
}

const curriculumTypeMap = { units: "unit", tags: "tag", dependencies: "dependency" };

const success = async (manifest, runtime) => {
  await runtime.locals.supabase
    .from(strings.capitalize(manifest.type))
    .update({ installed: true })
    .eq("id", manifest.id);
};

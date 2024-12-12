import { strings } from "@vivalence/shared";
import { Daemon, Module, Runtime } from "../../../types/types.d.ts";

export default async function install(daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
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

async function installCurriculum(runtime: Runtime, module: Module) {
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
      .map((resource) => runtime.call(`/${key}/install`, resource))
      .forEach((promise) => promises.push(promise));
  }

  const installations = await Promise.all(promises);
  return installations.every(({ status }) => status === "success");
}

const curriculumTypeMap = { units: "unit", tags: "tag", dependencies: "dependency" };

const success = async (manifest, runtime) => {
  await runtime.locals.supabase
    .from(strings.capitalize(manifest.type))
    .update({ installed: true })
    .eq("id", manifest.id);
};

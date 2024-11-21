import { strings } from "@vivalence/shared";

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
        // get curriculum
        let curriculum = module.Module.curriculum;
        if (typeof curriculum === "function") curriculum = await curriculum(runtime, module.Module);

        // install curriculum using {resource}/install
        const promises = [];
        for (const [key, resources] of Object.entries(curriculum)) {
          resources
            .map((resource) =>
              module.manifest.type === "corpus"
                ? { corpusId: module.manifest.id, ...resource }
                : resource,
            )
            .map((resource) => ({ [curriculumTypeMap[key]]: resource }))
            .map((resource) => runtime.call(`/${key}/install`, resource))
            .forEach((promise) => promises.push(promise));
        }
        const installations = await Promise.all(promises);
        module.manifest.installed = installations.every(({ status }) => status === "success");
        console.log("installations", installations.length);
      } else if (module.manifest.id) {
        module.manifest.installed = true;
      }

      console.log("install done @", module.manifest);
      if (module.manifest.installed) success(module.manifest, runtime);
      else console.warn("NO Install happened on:", module.manifest);
    }
  }
  return daemon;
}

const curriculumTypeMap = { units: "unit", tags: "tag", dependencies: "dependency" };

const success = async (manifest, runtime) => {
  await runtime.locals.supabase
    .from(strings.capitalize(manifest.type))
    .update({ installed: true })
    .eq("id", manifest.id);
};

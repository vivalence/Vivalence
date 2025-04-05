import { strings, array } from "@vivalence/shared";
import config from "@vivalence/config";
import { Daemon, Manifest, Runtime, RuntimeModule } from "@vivalence/types";
import { enums, TagEntity } from "@vivalence/schema";

export default function install(daemon: Daemon) {
  return async (runtime: Runtime) => {
    const modules = [
      runtime.domain,
      runtime.ontology,
      ...runtime.corpora,
      ...runtime.games,
      ...runtime.tactics,
    ].filter((module) => module.entity.installed === false);

    for (const module of modules) {
      try {
        const install = getInstaller(module);
        if (install) await install(runtime, module);
        module.entity.installation = enums.ModuleInstallation.INSTALLED;
      } catch (e) {
        console.log("installation error");
        console.log(e);
        module.entity.installation = enums.ModuleInstallation.FAULTY;
      } finally {
        await daemon.entities.em.flush();
      }
    }
    return runtime;
  };
}

function getInstaller(module: RuntimeModule) {
  if (typeof module.Module.install === "function") return module.Module.install;
  if (!["ontology", "corpus"].includes(module.Module.manifest.type)) return null;
  if (!module.Module.curriculum) throw new Error("L Daemon error: curriculum not found on module");
  if (typeof module.Module.curriculum === "function") return module.Module.curriculum;
  return installCurriculum;
}

// move to domain
async function installCurriculum(runtime: Runtime, module: RuntimeModule) {
  // TODO: might want to enforce tags->units->dependencies order.
  const curriculum = module.Module.curriculum;
  // curriculum.dependencies = [];
  // curriculum.units = [];
  // curriculum.tags = [];

  // const slug = "andando:andar-verb-ger";
  // curriculum.units = curriculum.units.filter((u) => u.slug === slug);
  // curriculum.units = curriculum.units.filter((u) => u.annotation.pos === "verb");
  // curriculum.units = curriculum.units.filter((u) => u.annotation.verbform === "fin");
  // curriculum.units.map((unit) => console.log(unit.annotation));
  // curriculum.units = [curriculum.units[Math.floor(Math.random() * curriculum.units.length)]];
  // curriculum.units = curriculum.units.sort(() => Math.random() - 0.5).slice(0, 1000);
  // curriculum.units = curriculum.units.sort().slice(base + 2000, base + 4000);

  // curriculum.tags = [curriculum.tags[Math.floor(Math.random() * curriculum.tags.length)]];

  for (const [resourceKey, resources] of Object.entries(curriculum)) {
    for (const resource of resources) {
      resource.runtime = runtime.entity.id;
      if (module.Module.manifest.type === "ontology") resource.ontology = module.entity.id;
      if (module.Module.manifest.type === "corpus") resource.corpus = module.entity.id;
    }
  }

  //call domain install.
  const installations = await runtime.call("/curriculum/install", curriculum);

  // until issues are persisted.
  if (!installations.every(({ status }) => status === "success")) {
    throw new Error("Runtime Installation Error", installations);
  }
}

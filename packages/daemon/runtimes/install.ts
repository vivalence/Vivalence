import { enums } from "@vivalence/entities";
import { Daemon } from "@vivalence/types";

export default function install(daemon: Daemon) {
  return async (runtime: any) => {
    const modules: any[] = [
      runtime.config.modules.ontology,
      ...runtime.config.modules.corpora,
    ].filter((module) => module.manifest.traits.includes("DATASET"));

    for (const module of modules) {
      const entity = runtime.entity.modules
        .filter((entity: any) => entity.type === module.manifest.type)
        .find((entity: any) => entity.slug === module.manifest.slug);

      if (entity.installed) continue;

      try {
        await runtime.config.domain.install(module, runtime);
        entity.installation = enums.installation.INSTALLED;
      } catch (error) {
        entity.installation = enums.installation.FAULTY;
        console.log("[MODULE INSTALLATION ERROR]");
        // console.error(error);
        // console.log(entity);
        throw error;
      } finally {
        await daemon.entities.em.flush();
      }
    }

    return runtime;
  };
}

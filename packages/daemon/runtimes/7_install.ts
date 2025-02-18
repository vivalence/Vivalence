import { strings, array } from "@vivalence/shared";
// import { wrap } from "@mikro-orm/core";
import config from "@vivalence/config";
import { Daemon, Manifest, Runtime, RuntimeModule } from "@vivalence/types";
import { enums, TagEntity } from "@vivalence/schema";

export default async function install(daemon: Daemon) {
  for (const runtime of daemon.runtimes.values() as unknown as Map<symbol, Runtime>) {
    const modules = [
      runtime,
      runtime.modules.domain,
      runtime.modules.ontology,
      ...runtime.modules.curricula,
      ...runtime.modules.games,
      ...runtime.modules.tactics,
      // ...runtime.modules.strategies,
    ].filter((module) => module.entity.installed === false);

    for (const module of modules) {
      const install = getInstaller(module);
      if (!install) continue; // TODO throw daemon level error.

      try {
        await install(runtime, module);
        module.entity.installation = enums.ModuleInstallation.INSTALLED;
      } catch (e) {
        console.log("installation error");
        console.log(e);
        module.entity.installation = enums.ModuleInstallation.FAULTY;
      } finally {
        await daemon.entities.em.flush();
      }
    }
  }
  return daemon;
}

function getInstaller(module: RuntimeModule) {
  // install can be a method or a object.
  if (typeof module.Module.install === "function") return module.Module.install;
  if (!["ontology", "curriculum"].includes(module.Module.manifest.type)) return null;
  if (!module.Module.curriculum) throw new Error("L Daemon error: curriculum not found on module");
  if (typeof module.Module.curriculum === "function") return module.Module.curriculum;
  return installWithCurriculum;
}

const resourceTypeMap = { units: "unit", tags: "tag", dependencies: "dependency" };

async function installWithCurriculum(runtime: Runtime, module: RuntimeModule) {
  // TODO: might want to enforce tags->units->dependencies order.
  const curriculum = module.Module.curriculum;
  // curriculum.tags = [curriculum.tags[Math.floor(Math.random() * curriculum.tags.length)]];

  for (const [resourceKey, resources] of Object.entries(curriculum)) {
    for (const resource of resources) {
      resource.runtime = runtime.entity.id;
      if (module.Module.manifest.type === "ontology") resource.ontology = module.entity.id;
      if (module.Module.manifest.type === "curriculum") resource.curriculum = module.entity.id;
    }
  }

  const promises = [];
  for (const [key, resources] of Object.entries(curriculum)) {
    resources
      .map((resource) => ({ [resourceTypeMap[key]]: resource }))
      .map((resource) => () => runtime.call(`/${resourceTypeMap[key]}/install`, resource))
      .forEach((promise) => promises.push(promise));
  }

  let i = 0;
  const installations = [];
  // TODO: requires entitymap management bc of parallel entity construction and patching.
  // if (promises.length > config.env.get("INSTALL_CHUNKING_THRESHOLD")) {
  //   for (const chunk of array.chunk(promises, config.env.get("INSTALL_CHUNK_SIZE"))) {
  //     await Promise.all(chunk.map(async (p) => installations.push(await p())));
  //     console.log("curriculum (chunked) install:", i++);
  //   }
  // } else {
  for (const promise of promises) {
    const result = await promise();
    installations.push(result);
    console.log("curriculum (linear) install:", i++, result.status, result.operation);
  }
  // }
  await runtime.entities.em.flush();

  if (!installations.every(({ status }) => status === "success")) {
    throw new Error("Runtime Installation Error", installations);
  }
}

// const success = async (manifest, runtime) => {
//   await runtime.locals.supabase
//     .from(strings.capitalize(manifest.type))
//     .update({ installed: true })
//     .eq("id", manifest.id);
// };

// async function installWithCurriculum(runtime: Runtime, module: RuntimeModule) {
//   // console.log("installing curriculum", module.Module.manifest);

//   // might want to enforce tags->units->dependencies order.
//   const { units = [], tags = [], dependencies = [] } = module.Module.curriculum;

//   for (const resource of [tags, units, dependencies].flat()) {
//     resource.runtime = runtime.entity.id;
//     if (module.Module.manifest.type === "ontology") resource.ontology = module.entity.id;
//     if (module.Module.manifest.type === "curriculum") resource.curriculum = module.entity.id;
//   }

//   if (!tags) return null;

//   const promises: Promise<{ status: string }>[] = [];

//   for (const tag of tags) {
//     promises.push(runtime.call(`/tag/install`, tag));
//   }
// }
// async function runInstalls(promises) {
//   const installations = [];
//   for (const chunk of array.chunk(promises, config.env.get("INSTALL_CHUNK_SIZE"))) {
//     await Promise.all(
//       chunk.map(async (promise) => {
//         try {
//           const installation = await promise();
//           // console.log("curriculum install:", installations.length, installation.status, installation.operation,);
//           installations.push(installation);
//         } catch (error) {
//           console.error("Error installing curriculum", error);
//           installations.push({ status: "error" });
//         }
//       }),
//     );
//   }
//   console.log("installations ", installations.length);

//   return installations.every(({ status }) => status === "success");
// }

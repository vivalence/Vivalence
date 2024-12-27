import { strings, array } from "@vivalence/shared";
import { Daemon, Manifest, Runtime, RuntimeModule } from "@vivalence/types";
import config from "@vivalence/config";

export default async function install(daemon: Daemon) {
    for (const [, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
        for (const module of [
            runtime,
            runtime.domain,
            runtime.ontology,
            ...runtime.corpora,
            ...runtime.games,
            ...runtime.tactics,
            ...runtime.strategies,
        ]) {
            if (module.manifest?.installed) continue;
            if (!module.manifest) continue;

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

async function installCurriculum(runtime: Runtime, module: RuntimeModule) {
    // might want to enforce tags->units->dependencies order.
    let curriculum = module.Module.curriculum;
    if (typeof curriculum === "function") curriculum = await curriculum(runtime, module.Module);

    const promises: Promise<{ status: string }>[] = [];

    for (const [key, resources] of Object.entries(curriculum)) {
        if (!runtime.manifest) continue;

        resources
            .map((resource: any) =>
                runtime.manifest.type === "corpus"
                    ? { corpusId: module.manifest.id, ...resource }
                    : resource,
            )
            .map((resource: any) => ({ [curriculumTypeMap[key]]: resource }))
            .map((resource: any) => runtime.call(`/${key}/install`, resource))
            .forEach((promise: Promise<{ status: string }>) => promise && promises.push(promise));
    }

    const installations = await Promise.all(promises);
    // const installations = [];

    // for (const chunk of array.chunk(promises, config.env.get("INSTALL_CHUNK_SIZE"))) {
    //     await Promise.all(
    //         chunk.map(async (promise) => {
    //             try {
    //                 const installation = await promise();
    //                 console.log(
    //                     "curriculum install:",
    //                     installations.length,
    //                     installation.status,
    //                     installation.operation,
    //                 );
    //                 installations.push(installation);
    //             } catch (error) {
    //                 console.error("Error installing curriculum", error);
    //                 installations.push({ status: "error" });
    //             }
    //         }),
    //     );
    // }
    // console.log("installations ", installations.length);

    return installations.every(({ status }) => status === "success");
}

const curriculumTypeMap: Record<string, string> = {
    units: "unit",
    tags: "tag",
    dependencies: "dependency",
};

const success = async (manifest: Manifest, runtime: Runtime) => {
    if (!runtime.Services?.supabase) return;

    await runtime.Services.supabase
        .from(strings.capitalize(manifest.type))
        .update({ installed: true })
        .eq("id", manifest.id);
};

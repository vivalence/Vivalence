import { Daemon } from "@vivalence/types";
import Repository from "@vivalence/repository";

export default function loadRuntimeServices(daemon) {
  return async (runtime) => {
    runtime.services = new Repository.services.Clients().join(daemon.services);
    await runtime.services.mount(runtime.config.services);

    // const clients = await Repository.services.mount.clients(runtime.config.services );
    // [daemon.services, clients].map((services) => {
    //   for (const [service, client] of Object.entries(services)) {
    //     runtime.services.add(service, client);
    //   }
    // });

    return runtime;
  };
}

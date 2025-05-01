import { Daemon } from "@vivalence/types";
import Repository from "@vivalence/repository";

export default function services(daemon: Daemon) {
  return async (runtime: any) => {
    runtime.services = new Repository.services.Clients().join(daemon.services);
    await runtime.services.mount(runtime.config.services);

    return runtime;
  };
}

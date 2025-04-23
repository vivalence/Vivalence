import config from "@vivalence/config";
import Repository from "@vivalence/repository";

export default {
  init: async function initServices(daemon) {
    daemon.services = new Repository.services.Clients();
    await daemon.services.mount(config.services);

    // daemon.services = new Services.Manager();
    // const clients = await Services.mount.clients(config.services, daemon);
    // for (const [service, client] of Object.entries(clients)) {
    //   daemon.services.add(service, client);
    // }

    return daemon;
  },
};

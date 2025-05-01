import config from "@vivalence/config";
import Repository from "@vivalence/repository";

export default {
  init: async function initServices(daemon) {
    daemon.services = new Repository.services.Clients();
    await daemon.services.mount(config.services);
    return daemon;
  },
};

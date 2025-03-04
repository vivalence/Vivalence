import config from "@vivalence/config";
import { services } from "@vivalence/shared";

export default {
  init: async function initServices(daemon) {
    daemon.services = await services.mountClients(config.services, daemon);
    return daemon;
  },
};

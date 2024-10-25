import config from "@vivalence/config";
import registry from "@vivalence/registry";

async function init(daemon) {
  await registry.init({ root: config.env.get("VIVA_MODULES_DIR") });
  daemon.registry = registry;
  return daemon;
}

export default { init };

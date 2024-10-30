import registry from "@vivalence/registry";

async function init(daemon) {
  await registry.init();
  daemon.registry = registry;
  return daemon;
}

export default { init };

import { spawn } from "../../lifecycle/boot.js";

export default {
  start: async function start(manifest, config) {
    return await spawn(manifest, config);
  },
  //   kill: (slugOrPid) => manager.kill(slugOrPid),
  //   watch: (callback) => manager.watch(callback),
};

import fromScope from "./fromScope.js";
import fromQueue from "./fromQueue.js";

function init(blacklist = {}) {
  blacklist.units = blacklist.units || [];
  blacklist.tags = blacklist.tags || [];
  blacklist.queue = blacklist.queue || [];

  return blacklist;
}

export default { fromScope, fromQueue, init };

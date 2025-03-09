import fromScope from "./fromScope.js";
import fromInstructionQueue from "./fromQueue.js";

function init(blacklist = {}) {
  blacklist.units = blacklist.units || [];
  blacklist.tags = blacklist.tags || [];
  blacklist.instructions = blacklist.instructions || [];

  return blacklist;
}

export default { fromScope, fromInstructionQueue, init };

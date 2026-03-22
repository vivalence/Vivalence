import { Aperture } from "@vivalence/typology";

import * as pick from "./pick/index.js";
import * as review from "./review/index.js";
// import * as classify from "./classify.js";

export const aperture = new Aperture()
  .open("/pick/literal/feed", pick.literal.feed)
  .open("/pick/literal/novel", pick.literal.novel)
  .open("/pick/literal/due", pick.literal.due)
  .open("/pick/literal/byStatus", pick.literal.byStatus)
  .open("/pick/literal/byStrength", pick.literal.byStrength)
  // .open("/pick/symbol/feed", pick.symbol.feed) .open("/pick/symbol/byStatus", pick.symbol.byStatus) .open("/pick/symbol/byStrength", pick.symbol.byStrength)
  // .open("/review/buffer", review.buffer)
  .open("/review/literal", review.literal)
  // .open("/review/symbol", review.symbol)
  .open("/review/memory", review.memory);
// .open("/classify/text", classify.text);

// import tag from "./entities/tag/index.js";
// import unit from "./entities/unit/index.js";
// import head from "./methods/head/index.js";
// import feed from "./methods/feed/index.js";
// import provision from "./methods/provision/index.js";
// import classify from "./methods/classify/index.js";

// .open("/literal/identity", literal.identity)
// .open("/literal/install", literal.install)
// .open("/literal/validate", literal.validate)
// .open("/symbol/validate", symbol.validate)
// .open("/symbol/install", symbol.install)
// .open("/feed/remove", feed.remove)
// .open("/feed/tactic", feed.tactic)
// .open("/feed/game", feed.game)
// .open("/provision/game", provision.game)
// .open("/provision/tactic", provision.tactic)

// .open("/head/activity/recent", head.activity.recent)

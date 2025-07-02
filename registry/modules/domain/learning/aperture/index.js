import tag from "./entities/tag/index.js";
import unit from "./entities/unit/index.js";

import head from "./methods/head/index.js";
import feed from "./methods/feed/index.js";
import provision from "./methods/provision/index.js";
import pick from "./methods/pick/index.js";
import classify from "./methods/classify/index.js";
import review from "./methods/review/index.js";

function boot(runtime) {
  runtime.aperture.open("/head/activity/recent", head.activity.recent);

  runtime.aperture.open("/review/annotation", review.annotation);
  runtime.aperture.open("/review/scope", review.scope);
  runtime.aperture.open("/review/unit", review.unit);
  runtime.aperture.open("/review/tag", review.tag);
  runtime.aperture.open("/review/memory", review.memory);
  runtime.aperture.open("/review/play", review.play);

  runtime.aperture.open("/unit/identity", unit.identity);
  runtime.aperture.open("/unit/install", unit.install);
  runtime.aperture.open("/unit/validate", unit.validate);

  runtime.aperture.open("/tag/validate", tag.validate);
  runtime.aperture.open("/tag/install", tag.install);

  runtime.aperture.open("/feed/remove", feed.remove);
  runtime.aperture.open("/feed/tactic", feed.tactic);
  runtime.aperture.open("/feed/game", feed.game);

  runtime.aperture.open("/provision/game", provision.game);
  runtime.aperture.open("/provision/tactic", provision.tactic);

  runtime.aperture.open("/classify/text", classify.text);
  runtime.aperture.open("/classify/test", classify.test);

  runtime.aperture.open("/pick/tag/byStatus", pick.tag.byStatus);
  runtime.aperture.open("/pick/tag/byStrength", pick.tag.byStrength);
  runtime.aperture.open("/pick/tag/pending", pick.tag.pending);
  runtime.aperture.open("/pick/unit/new", pick.unit.new);
  runtime.aperture.open("/pick/unit/due", pick.unit.due);
  runtime.aperture.open("/pick/unit/byAnnotation", pick.unit.byAnnotation);
  runtime.aperture.open("/pick/unit/byStatus", pick.unit.byStatus);
  runtime.aperture.open("/pick/unit/byStrength", pick.unit.byStrength);
  runtime.aperture.open("/pick/unit/pending", pick.unit.pending);

  return runtime;
}

export default { boot };

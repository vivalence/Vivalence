import tag from "./entities/tag/index.js";
import unit from "./entities/unit/index.js";

import head from "./methods/head/index.js";
import feed from "./methods/feed/index.js";
import provision from "./methods/provision/index.js";
import pick from "./methods/pick/index.js";
import classify from "./methods/classify/index.js";
import review from "./methods/review/index.js";

export default function (aperture) {
  aperture.open("/head/activity/recent", head.activity.recent);

  aperture.open("/review/annotation", review.annotation);
  aperture.open("/review/scope", review.scope);
  aperture.open("/review/unit", review.unit);
  aperture.open("/review/tag", review.tag);
  aperture.open("/review/memory", review.memory);
  aperture.open("/review/play", review.play);

  aperture.open("/unit/identity", unit.identity);
  aperture.open("/unit/install", unit.install);
  aperture.open("/unit/validate", unit.validate);

  aperture.open("/tag/validate", tag.validate);
  aperture.open("/tag/install", tag.install);

  aperture.open("/feed/remove", feed.remove);
  aperture.open("/feed/tactic", feed.tactic);
  aperture.open("/feed/game", feed.game);

  aperture.open("/provision/game", provision.game);
  aperture.open("/provision/tactic", provision.tactic);

  aperture.open("/classify/text", classify.text);
  aperture.open("/classify/test", classify.test);

  aperture.open("/pick/tag/byStatus", pick.tag.byStatus);
  aperture.open("/pick/tag/byStrength", pick.tag.byStrength);
  aperture.open("/pick/tag/pending", pick.tag.pending);
  aperture.open("/pick/unit/new", pick.unit.new);
  aperture.open("/pick/unit/due", pick.unit.due);
  aperture.open("/pick/unit/byAnnotation", pick.unit.byAnnotation);
  aperture.open("/pick/unit/byStatus", pick.unit.byStatus);
  aperture.open("/pick/unit/byStrength", pick.unit.byStrength);
  aperture.open("/pick/unit/pending", pick.unit.pending);
}

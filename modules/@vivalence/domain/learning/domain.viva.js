import { Aperture } from "@vivalence/vector/aperture";
import config from "@vivalence/config";

import * as da from "./aperture/index.js";
import entities from "./entities/index.js";
import modules from "./modules/index.js";

export const maps = { entities, modules };
// export lifecycle from "./lifecycle/index.js";

export const manifest = {
  //? Manifest .. why not
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
  traits: [],
};

export const aperture = new Aperture();

// .open("/head/activity/recent", head.activity.recent)
// .open("/review/annotation", review.annotation)
// .open("/review/scope", review.scope)
// .open("/review/unit", review.unit)
// .open("/review/tag", review.tag)
// .open("/review/memory", review.memory)
// .open("/review/play", review.play)
// .open("/unit/identity", unit.identity)
// .open("/unit/install", unit.install)
// .open("/unit/validate", unit.validate)
// .open("/tag/validate", tag.validate)
// .open("/tag/install", tag.install)
// .open("/feed/remove", feed.remove)
// .open("/feed/tactic", feed.tactic)
// .open("/feed/game", feed.game)
// .open("/provision/game", provision.game)
// .open("/provision/tactic", provision.tactic)
// .open("/pick/tag/byStatus", pick.tag.byStatus)
// .open("/pick/tag/byStrength", pick.tag.byStrength)
// .open("/pick/tag/pending", pick.tag.pending)
// .open("/pick/unit/new", pick.unit.new)
// .open("/pick/unit/due", pick.unit.due)
// .open("/pick/unit/byAnnotation", pick.unit.byAnnotation)
// .open("/pick/unit/byStatus", pick.unit.byStatus)
// .open("/pick/unit/byStrength", pick.unit.byStrength)
// .open("/pick/unit/pending", pick.unit.pending);
//

// import review from "./review/index.js";
// import pick from "./pick/index.js";

import corpus from "./modules/corpus/index.js";
import dependency from "./entities/dependency/index.js";
import tag from "./entities/tag/index.js";
import unit from "./entities/unit/index.js";

import feed from "./methods/feed/index.js";
import provision from "./methods/provision/index.js";
import pick from "./methods/pick/index.js";
// import conditions from "./conditions/index.js";
// import scope from "./scope/index.js";
// import tactics from "./tactics/index.js";
// import games from "./games/index.js";
// import strategies from "./strategies/index.js";

// import memoryStatus from "../middlewares/memory/statusChangeEventEmitter.js";

function boot(runtime) {
  runtime.aperture.open("/corpus/install", corpus.install);
  runtime.aperture.open("/tag/install", tag.install);

  runtime.aperture.open("/feed/dependency", feed.dependency);
  runtime.aperture.open("/provision/dependency", provision.dependency);
  runtime.aperture.open("/provision/tactic", provision.tactic);

  // route("/unit/fromTagSlugs", units.fromTagSlugs);
  // route("/unit/fromSlugs", units.fromSlugs);
  // route("/unit/fromSlug", units.fromSlug);
  // route("/unit/fromTagIds", units.fromTagIds);
  // route("/unit/fromUnitIds", units.fromUnitIds);
  runtime.aperture.open("/unit/install", unit.install);
  // route("/unit/remove", units.remove);

  // route("/tactic/fromSlug", tactics.fromSlug);
  // route("/tactic/install", tactics.install);
  // route("/tactic/provision", tactics.provision);

  runtime.aperture.open("/dependency/install", dependency.install);
  // route("/dependencies/remove", dependencies.remove);
  // route("/dependencies/compute", dependencies.compute);

  // route("/conditions/install", conditions.install);
  // route("/conditions/remove", conditions.remove);
  // route("/conditions/compute", conditions.compute);

  // route("/games/fromSlug", games.fromSlug);
  // route("/scope/hydrate", scope.hydrate);

  // route("/strategies/install", strategies.install);

  // route("/review/memory", middleware.post.compose(memoryStatus), review.memory);
  // route("/review/play", review.play);
  // route("/review/tag", review.tag);
  // route("/review/unit", review.unit);

  runtime.aperture.open("/pick/tag/byStatus", pick.tag.byStatus);
  runtime.aperture.open("/pick/tag/byStrength", pick.tag.byStrength);
  runtime.aperture.open("/pick/tag/pending", pick.tag.pending);
  runtime.aperture.open("/pick/unit/new", pick.unit.new);
  runtime.aperture.open("/pick/unit/due", pick.unit.due);
  runtime.aperture.open("/pick/unit/byStatus", pick.unit.byStatus);
  runtime.aperture.open("/pick/unit/byStrength", pick.unit.byStrength);
  runtime.aperture.open("/pick/unit/pending", pick.unit.pending);

  // route("/tag/fromOntology", tags.fromOntology);
  // route("/tag/fromSlugs", tags.fromSlugs);
  // route("/tag/fromSlug", tags.fromSlug);
  // route("/tag/fromTagIds", tags.fromTagIds);
  // route("/tag/fromUnit", tags.fromUnit);

  return runtime;
}

export default { boot };

// import memory from "./memory/index.js";
// import play from "./play/index.js";

// route("/memory/review", middleware.post.compose(memoryStatus), review.memory); // DEPRECATED
// route("/play/review", review.play); // DEPRECATED
// route("/tags/review", review.tag); // DEPRECATED
// route("/units/review", review.unit); // DEPRECATED

// route("/memory/filter/tags/byStatus", memory.filterTagsByStatus); // DEPRECATED
// route("/memory/filter/tags/byStrength", memory.filterTagsByStrength); // DEPRECATED
// route("/memory/filter/units/byStatus", memory.filterUnitsByStatus); // DEPRECATED
// route("/memory/filter/units/byStrength", memory.filterUnitsByStrength); // DEPRECATED
// route("/tags/pending", tags.pending); // DEPRECATED
// route("/units/due", units.due); // DEPRECATED
// route("/units/pending", units.pending); // DEPRECATED

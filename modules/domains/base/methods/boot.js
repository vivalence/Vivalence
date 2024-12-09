import review from "./review/index.js";
import pick from "./pick/index.js";

import dependencies from "./dependencies/index.js";
import conditions from "./conditions/index.js";
import scope from "./scope/index.js";
import tags from "./tags/index.js";
import units from "./units/index.js";
import tactics from "./tactics/index.js";
import games from "./games/index.js";
import strategies from "./strategies/index.js";

import memoryStatus from "../middlewares/memory/statusChangeEventEmitter.js";

async function boot(runtime) {
  const { route, middleware } = runtime.router;

  route("/review/memory", middleware.post.compose(memoryStatus), review.memory);
  route("/review/play", review.play);
  route("/review/tag", review.tag);
  route("/review/unit", review.unit);

  route("/pick/tags/byStatus", pick.tags.byStatus);
  route("/pick/tags/byStrength", pick.tags.byStrength);
  route("/pick/tags/pending", pick.tags.pending);

  route("/pick/units/byStatus", pick.units.byStatus);
  route("/pick/units/byStrength", pick.units.byStrength);
  route("/pick/units/pending", pick.units.pending);

  route("/tags/fromOntology", tags.fromOntology);
  route("/tags/fromSlug", tags.fromSlug);
  route("/tags/fromTagIds", tags.fromTagIds);
  route("/tags/fromUnit", tags.fromUnit);
  route("/tags/install", tags.install);

  route("/units/fromSlug", units.fromSlug);
  route("/units/fromTagIds", units.fromTagIds);
  route("/units/fromUnitIds", units.fromUnitIds);
  route("/units/install", units.install);
  route("/units/remove", units.remove);

  route("/tactics/fromSlug", tactics.fromSlug);
  route("/tactics/install", tactics.install);
  route("/tactics/provision", tactics.provision);

  route("/dependencies/install", dependencies.install);
  route("/dependencies/remove", dependencies.remove);
  route("/dependencies/compute", dependencies.compute);

  route("/conditions/install", conditions.install);
  route("/conditions/remove", conditions.remove);
  route("/conditions/compute", conditions.compute);

  route("/games/fromSlug", games.fromSlug);
  route("/scope/hydrate", scope.hydrate);
  route("/strategies/install", strategies.install);

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

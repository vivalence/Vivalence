import dependencies from "./dependencies/index.js";
import conditions from "./conditions/index.js";
import memory from "./memory/index.js";
import play from "./play/index.js";
import instructions from "./instructions/index.js";
import scope from "./scope/index.js";
import tags from "./tags/index.js";
import units from "./units/index.js";
import tactics from "./tactics/index.js";
import games from "./games/index.js";
import strategies from "./strategies/index.js";

import memoryStatus from "../middlewares/memory/statusChangeEventEmitter.js";

async function boot(runtime) {
  const { route, middleware } = runtime.router;

  route("/dependencies/install", dependencies.install);
  route("/dependencies/remove", dependencies.remove);
  route("/dependencies/compute", dependencies.compute);

  route("/conditions/install", conditions.install);
  route("/conditions/remove", conditions.remove);
  route("/conditions/compute", conditions.compute);

  route("/games/fromSlug", games.fromSlug);

  route("/instructions/provision", instructions.provision);
  route("/instructions/remove", instructions.remove);
  route("/instructions/get", instructions.get);

  route("/memory/filter/tags/byStatus", memory.filterTagsByStatus);
  route("/memory/filter/tags/byStrength", memory.filterTagsByStrength);
  route("/memory/filter/units/byStatus", memory.filterUnitsByStatus);
  route("/memory/filter/units/byStrength", memory.filterUnitsByStrength);

  route("/memory/update", middleware.post.compose(memoryStatus), memory.update);

  route("/play/update", play.update);

  route("/scope/hydrate", scope.hydrate);

  route("/strategies/install", strategies.install);

  route("/tactics/fromSlug", tactics.fromSlug);
  route("/tactics/install", tactics.install);
  route("/tactics/provision", tactics.provision);

  route("/tags/fromOntology", tags.fromOntology);
  route("/tags/fromSlug", tags.fromSlug);
  route("/tags/fromTagIds", tags.fromTagIds);
  route("/tags/fromUnit", tags.fromUnit);
  route("/tags/install", tags.install);
  route("/tags/pending", tags.pending);
  route("/tags/review", tags.review);
  route("/tags/weakest", tags.weakest);

  // runtime.route("/tags/traits/completable", tag.TraitsCompleteable);
  // runtime.route("/tags/traits/learnable", tag.TraitsLearnable);

  route("/units/due", units.due);
  route("/units/fromSlug", units.fromSlug);
  route("/units/fromTagIds", units.fromTagIds);
  route("/units/fromUnitIds", units.fromUnitIds);
  route("/units/install", units.install);
  route("/units/pending", units.pending);
  route("/units/remove", units.remove);
  route("/units/review", units.review);

  return runtime;
}

export default { boot };

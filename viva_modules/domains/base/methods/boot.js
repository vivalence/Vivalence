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

async function boot(runtime) {
  runtime.router.route("/dependencies/install", dependencies.install);
  runtime.router.route("/dependencies/remove", dependencies.remove);
  runtime.router.route("/dependencies/compute", dependencies.compute);

  runtime.router.route("/conditions/install", conditions.install);
  runtime.router.route("/conditions/remove", conditions.remove);
  runtime.router.route("/conditions/compute", conditions.compute);

  runtime.router.route("/games/fromSlug", games.fromSlug);

  runtime.router.route("/instructions/provision", instructions.provision);
  runtime.router.route("/instructions/remove", instructions.remove);
  runtime.router.route("/instructions/get", instructions.get);

  runtime.router.route("/memory/filter/tags/byStatus", memory.filterTagsByStatus);
  runtime.router.route("/memory/filter/tags/byStrength", memory.filterTagsByStrength);
  runtime.router.route("/memory/filter/units/byStatus", memory.filterUnitsByStatus);
  runtime.router.route("/memory/filter/units/byStrength", memory.filterUnitsByStrength);
  runtime.router.route("/memory/update", memory.update);
  runtime.router.route("/memory/update/tag", memory.update);
  runtime.router.route("/memory/update/unit", memory.update);

  runtime.router.route("/play/update", play.update);

  runtime.router.route("/scope/hydrate", scope.hydrate);

  runtime.router.route("/strategies/install", strategies.install);

  runtime.router.route("/tactics/fromSlug", tactics.fromSlug);
  runtime.router.route("/tactics/install", tactics.install);
  runtime.router.route("/tactics/provision", tactics.provision);

  runtime.router.route("/tags/fromOntology", tags.fromOntology);
  runtime.router.route("/tags/fromSlug", tags.fromSlug);
  runtime.router.route("/tags/fromTagIds", tags.fromTagIds);
  runtime.router.route("/tags/fromUnit", tags.fromUnit);
  runtime.router.route("/tags/install", tags.install);
  runtime.router.route("/tags/pending", tags.pending);
  runtime.router.route("/tags/review", tags.review);
  runtime.router.route("/tags/weakest", tags.weakest);

  // runtime.router.route("/tags/traits/completable", tag.TraitsCompleteable);
  // runtime.router.route("/tags/traits/learnable", tag.TraitsLearnable);

  runtime.router.route("/units/due", units.due);
  runtime.router.route("/units/fromSlug", units.fromSlug);
  runtime.router.route("/units/fromTagIds", units.fromTagIds);
  runtime.router.route("/units/fromUnitIds", units.fromUnitIds);
  runtime.router.route("/units/install", units.install);
  runtime.router.route("/units/pending", units.pending);
  runtime.router.route("/units/remove", units.remove);
  runtime.router.route("/units/review", units.review);

  return runtime;
}

export default { boot };

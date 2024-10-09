// @lj i should build an autoloader for the methods. load everything but lib and index.

import deleteInstructions from "./instructions/delete.js";
import getInstructions from "./instructions/get.js";
import provisionInstructions from "./instructions/provision.js";

import updateMemory from "./memory/update.js";

import updateTagMemory from "./memory/update/tag.js";
import updateUnitMemory from "./memory/update/unit.js";

import tagsFilterByMemory from "./memory/filter/tags.js";
import unitsFilterByMemory from "./memory/filter/units.js";
import updatePlay from "./play/update.js";
import updateUnitPlay from "./play/update/unit.js";
import updateTagPlay from "./play/update/tag.js";
import hydrateScope from "./scope/hydrate.js";

import tagsFromTagIds from "./tags/fromTagIds.js";
import tagsFromUnit from "./tags/fromUnit.js";
import tagsPending from "./tags/pending.js";
import tagsReview from "./tags/review.js";
import tagsWeakest from "./tags/weakest.js";
import tagFromSlug from "./tags/fromSlug.js";
import tagsFromOntology from "./tags/fromOntology.js";
import tagsSlugFrom from "./tags/slugFrom.js";
import tagsCompleteable from "./tags/completable.js";

import weakestUnitsFromTagIds from "./units/weakest/fromTagIds.js";
import weakestUnitsFromUnitIds from "./units/weakest/fromUnitIds.js";
import unitsFromTagIds from "./units/fromTagIds.js";
import unitsFromUnitIds from "./units/fromUnitIds.js";
import unitsPending from "./units/pending.js";
import unitsReview from "./units/review.js";
import unitsSlugFromAnnotation from "./units/slugFromAnnotation.js";

import tacticsFromSlug from "./tactics/fromSlug.js";
import gamesFromSlug from "./games/fromSlug.js";

import install from "./install/index.js";
import remove from "./remove/index.js";

async function boot(runtime) {
  runtime.router.route("/install/tactic", install.tactic);
  runtime.router.route("/install/strategy", install.strategy);
  runtime.router.route("/install/unit", install.unit);
  runtime.router.route("/install/tag", install.tag);

  runtime.router.route("/remove/unit", remove.unit);

  runtime.router.route("/instructions/provision", provisionInstructions);
  runtime.router.route("/instructions/delete", deleteInstructions);
  runtime.router.route("/instructions/get", getInstructions);

  runtime.router.route("/memory/update", updateMemory);
  runtime.router.route("/memory/update/tag", updateTagMemory);
  runtime.router.route("/memory/update/unit", updateUnitMemory);
  runtime.router.route("/memory/filter/tags", tagsFilterByMemory);
  runtime.router.route("/memory/filter/units", unitsFilterByMemory);

  runtime.router.route("/play/update", updatePlay);
  runtime.router.route("/play/update/unit", updateUnitPlay);
  runtime.router.route("/play/update/tag", updateTagPlay);
  runtime.router.route("/scope/hydrate", hydrateScope);

  runtime.router.route("/tags/fromTagIds", tagsFromTagIds);
  runtime.router.route("/tags/fromUnit", tagsFromUnit);
  runtime.router.route("/tags/pending", tagsPending);
  runtime.router.route("/tags/review", tagsReview);
  runtime.router.route("/tags/weakest", tagsWeakest);
  runtime.router.route("/tags/fromSlug", tagFromSlug);
  runtime.router.route("/tags/fromOntology", tagsFromOntology);
  runtime.router.route("/tags/slugFrom", tagsSlugFrom);
  runtime.router.route("/tags/completable", tagsCompleteable);

  runtime.router.route("/units/fromTagIds", unitsFromTagIds);
  runtime.router.route("/units/fromUnitIds", unitsFromUnitIds);
  runtime.router.route("/units/pending", unitsPending);
  runtime.router.route("/units/review", unitsReview);
  runtime.router.route("/units/weakest/fromTagIds", weakestUnitsFromTagIds);
  runtime.router.route("/units/weakest/fromUnitIds", weakestUnitsFromUnitIds);
  runtime.router.route("/units/slugFromAnnotation", unitsSlugFromAnnotation);

  runtime.router.route("/tactics/fromSlug", tacticsFromSlug);
  runtime.router.route("/games/fromSlug", gamesFromSlug);

  return runtime;
}

export default { boot };

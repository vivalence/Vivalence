// @lj i should build an autoloader for the methods. load everything but lib and index.
import autocompleteUnits from "./diagnostics/autocomplete/units/index.js";
import deduplicateUnits from "./diagnostics/deduplicate/units/index.js";
import predictUnits from "./diagnostics/predict/units/index.js";
import predictTags from "./diagnostics/predict/tags/index.js";
import validateUnit from "./diagnostics/validate/unit/index.js";

import deleteInstructions from "./methods/instructions/delete.js";
import getInstructions from "./methods/instructions/get.js";
import provisionInstructions from "./methods/instructions/provision.js";
import testInstructions from "./methods/instructions/test/index.js";

import updateMemory from "./methods/memory/update.js";
import tagsFilterByMemory from "./methods/memory/filter/tags.js";
import unitsFilterByMemory from "./methods/memory/filter/units.js";
import updatePlay from "./methods/play/update.js";
import hydrateScope from "./methods/scope/hydrate.js";

import tagsFromTagIds from "./methods/tags/fromTagIds.js";
import tagsFromUnit from "./methods/tags/fromUnit.js";
import tagsPending from "./methods/tags/pending.js";
import tagsReview from "./methods/tags/review.js";
import tagsWeakest from "./methods/tags/weakest.js";

import weakestUnitsFromTagIds from "./methods/units/weakest/fromTagIds.js";
import weakestUnitsFromUnitIds from "./methods/units/weakest/fromUnitIds.js";
import unitsFromTagIds from "./methods/units/fromTagIds.js";
import unitsFromUnitIds from "./methods/units/fromUnitIds.js";
import unitsPending from "./methods/units/pending.js";
import unitsReview from "./methods/units/review.js";

async function boot(runtime) {
  runtime.router.route("/diagnostics/autocomplete/units", autocompleteUnits);
  runtime.router.route("/diagnostics/deduplicate/units", deduplicateUnits);
  runtime.router.route("/diagnostics/predict/tags", predictTags);
  runtime.router.route("/diagnostics/predict/units", predictUnits);
  runtime.router.route("/diagnostics/validate/unit", validateUnit);

  runtime.router.route("/provision/instructions", provisionInstructions);
  runtime.router.route("/instructions/delete", deleteInstructions);
  runtime.router.route("/instructions/get", getInstructions);
  runtime.router.route("/instructions/test", testInstructions);

  runtime.router.route("/memory/update", updateMemory);
  runtime.router.route("/memory/filter/tags", tagsFilterByMemory);
  runtime.router.route("/memory/filter/units", unitsFilterByMemory);

  runtime.router.route("/play/update", updatePlay);
  runtime.router.route("/scope/hydrate", hydrateScope);

  runtime.router.route("/tags/fromTagIds", tagsFromTagIds);
  runtime.router.route("/tags/fromUnit", tagsFromUnit);
  runtime.router.route("/tags/pending", tagsPending);
  runtime.router.route("/tags/review", tagsReview);
  runtime.router.route("/tags/weakest", tagsWeakest);

  runtime.router.route("/units/fromTagIds", unitsFromTagIds);
  runtime.router.route("/units/fromUnitIds", unitsFromUnitIds);
  runtime.router.route("/units/pending", unitsPending);
  runtime.router.route("/units/review", unitsReview);
  runtime.router.route("/units/weakest/fromTagIds", weakestUnitsFromTagIds);
  runtime.router.route("/units/weakest/fromUnitIds", weakestUnitsFromUnitIds);
  return runtime;
}

export default {
  manifest: {
    type: "Domain",
    slug: "base",
    name: "Base",
    description: "Basic domain with units tags ebisu and annotations",
    modules: {
      ontology: "file://../ontology/ontology.viva.js",
    },
  },
  boot,
};

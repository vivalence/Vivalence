import classification from "./classification/index.js";
import diagnostics from "./diagnostics/index.js";
import remedy from "./remedy/index.js";
import identity from "./identity/index.js";

async function boot(runtime) {
  runtime.router.route("/identity/unit", identity.unit);
  runtime.router.route("/identity/tag", identity.tag);

  runtime.router.route("/classification/unitFromAnnotation", classification.unitFromAnnotation);
  runtime.router.route("/classification/annotationsFromText", classification.annotationsFromText);
  runtime.router.route("/classification/unitsFromText", classification.unitsFromText);

  runtime.router.route("/diagnostics/autocomplete/units", diagnostics.autocomplete.units);
  runtime.router.route("/diagnostics/duplicates/annotation", diagnostics.duplicates.annotation);
  runtime.router.route("/diagnostics/predict/tags", diagnostics.predict.tags);
  runtime.router.route("/diagnostics/predict/units", diagnostics.predict.units);

  runtime.router.route("/diagnostics/validate/unit", diagnostics.validate.unit);
  runtime.router.route("/diagnostics/validate/unit/pos", diagnostics.validate.unit.pos);
  runtime.router.route("/diagnostics/validate/unit/schema", diagnostics.validate.unit.schema);
  runtime.router.route("/diagnostics/validate/unit/tags", diagnostics.validate.unit.tags);

  runtime.router.route("/diagnostics/validate/tag", diagnostics.validate.tag);
  runtime.router.route("/diagnostics/validate/tag/schema", diagnostics.validate.tag.schema);

  runtime.router.route("/remedy", remedy);

  return runtime;
}
export default { boot };

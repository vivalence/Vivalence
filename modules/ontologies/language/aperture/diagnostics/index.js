import autocompleteUnits from "./autocomplete/units/index.js";
import duplicatesAnnotation from "./duplicates/annotation/index.js";
import predictUnits from "./predict/units/index.js";
import predictTags from "./predict/tags/index.js";
// import validateUnit from "./validate/unit/index.js";
// import validateTag from "./validate/tag/index.js";

export default {
  autocomplete: { units: autocompleteUnits },
  duplicates: { annotation: duplicatesAnnotation },
  predict: { units: predictUnits, tags: predictTags },
  // validate: { unit: validateUnit, tag: validateTag },
};

import required from "./required.js";
import annotationRemedies from "./annotation/index.js";
import symbolsRemedies from "./symbols/index.js";

export default [required, ...annotationRemedies, ...symbolsRemedies];

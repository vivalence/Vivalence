import articles from "./dependencies/articles.js";
import pronouns from "./dependencies/pronouns.js";
import verbs from "./dependencies/verb-regularity.js";
import ser_estar from "./dependencies/ser-estar.js";
import objects from "./dependencies/objects.js";
// mastery

// export default [...pronouns];
export default [...pronouns, ...articles, ...verbs, ...ser_estar, ...objects];

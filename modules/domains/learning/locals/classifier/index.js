// import annotationsFromText from "./annotationsFromText/index.js";
// import unitFromAnnotation from "./unitFromAnnotation/index.js";
// import unitsFromText from "./unitsFromText/index.js";

import annotate from "./text/annotate.js";
import unitFromAnnotation from "./lib/unitsFromAnnotation.js";

export default class Classifier {
  signals = [];

  build() {
    return {
      text: async (text) => {
        const { analysis } = await ctx.runtime.services.nlp({ text });

        const annotations = analysis.sentences.map((sentence) => {
          return sentence.tokens.map((t) => annotate(t, ctx));
        });

        const tokens = await Promise.all(
          annotations.flat().map(async (annotation) => {
            const unit = await unitFromAnnotation({ annotation }, ctx);
            return { annotation, unit };
          }),
        );

        //
        // returns [{ annotation, unit, meta }]
      },
    };
  }
}

// export default {
//   annotationsFromText,
//   unitFromAnnotation,
//   unitsFromText,
// };

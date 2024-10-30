import annotationsFromText from "../annotationsFromText/index.js";
import unitFromAnnotation from "../unitFromAnnotation/index.js";

export default async function unitsFromText({ text }, ctx) {
  const annotations = await annotationsFromText({ text }, ctx);

  const tokens = await Promise.all(
    annotations.flat().map(async (annotation) => {
      const unit = await unitFromAnnotation({ annotation }, ctx);
      return { annotation, unit };
    }),
  );

  return tokens;
}

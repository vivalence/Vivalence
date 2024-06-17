import annotationsFromText from "./annotationsFromText";
import unitFromAnnotation from "./unitFromAnnotation";

const unitsFromText = async ({ text }, locals) => {
    const annotations = await annotationsFromText({ text }, locals);

    const tokens = await Promise.all(
        annotations.flat().map(async (annotation) => {
            const input = { annotation };
            const unit = await unitFromAnnotation(input, locals);
            return { annotation, unit };
        })
    );

    return tokens;
};

export { annotationsFromText, unitFromAnnotation, unitsFromText };

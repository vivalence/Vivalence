import Joi from "joi";
import schemas from "./schemas";
import fetchTags from "./fetchTags";
import validateTags from "./validateTags";

// what am i validating for each unit
// 1. annotation
//    has the correct fields
// 2. tags - specific
//    the tags in the annotation is present
// 3. tags - potential
//    the correct potential morphological variables are tagged

// i must have define the negative space for tags.
// like:
// only 1 pos tag.
// one of these x ontological tags
// no verbform, xyz

// should i have rules about 'nouns allways stored singular' ... etc?

export default async function (unit, locals) {
    const errors = [];

    const { annotation } = unit.data;
    if (!annotation.pos)
        errors.push({
            message: "Annotation is missing pos."
        });
    if (errors.length > 0) return { isValid: false, errors };

    const schema = schemas[annotation.pos];
    if (!schema) errors.push({ message: `No schema found for pos: ${annotation.pos}` });
    if (errors.length > 0) return { isValid: false, errors };

    const { error: validationError } = schema.annotation.validate(annotation, {
        abortEarly: false
    });
    if (validationError) {
        errors.push(...validationError.details);
    }
    try {
        const { branches, leafs } = await fetchTags(unit.id, locals);

        schema.tags.forEach((tag) => {
            errors.push(...validateTags(branches, leafs, tag));
        });
    } catch (fetchError) {
        errors.push(fetchError.message);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

export default function validateTags(branches, leafs, tag) {
    const errors = [];

    if (tag.unique) {
        // { unique: { branch: "pos" } },
        const uniqueBranchValid = tag.unique.branch
            ? branches.get(tag.unique.branch)?.length === 1
            : true;
        const uniqueLeafValid = tag.unique.leaf ? leafs.get(tag.unique.leaf)?.length === 1 : true;

        if (!uniqueBranchValid || !uniqueLeafValid) {
            errors.push({
                test: tag,
                message: `There must be exactly one tag with branch '${tag.unique.branch || ""}' and leaf '${tag.unique.leaf || ""}'.`
            });
        }
    } else if (tag.not) {
        // { not: { branch: "pos" } }
        const notValid =
            (!tag.not.branch || branches.has(tag.not.branch)) &&
            (!tag.not.leaf || leafs.has(tag.not.leaf));
        if (notValid) {
            errors.push({
                test: tag,
                message: `Tag with branch '${tag.not.branch || ""}' and leaf '${tag.not.leaf || ""}' should not be present.`
            });
        }
    } else if (tag.oneOf) {
        // {oneOf: [{ branch: "pos", leaf: "verb" }, { branch: "pos", leaf: "aux" }]}
        // should handle recursion

        const oneOfValid = tag.oneOf.some(
            (t) =>
                (!t.branch ||
                    (branches.has(t.branch) && branches.get(t.branch).includes(t.leaf))) &&
                (!t.leaf || (leafs.has(t.leaf) && leafs.get(t.leaf).includes(t.branch)))
        );
        if (!oneOfValid) {
            errors.push({
                test: tag,
                message: `One of ${JSON.stringify(tag.oneOf)} must be present.`
            });
        }
    } else if (tag.none) {
        // {none: [{ branch: "tense" }, { branch: "mood" }]}
        // should handle recursion

        const noneValid = tag.none.every(
            (t) => (!t.branch || !branches.has(t.branch)) && (!t.leaf || !leafs.has(t.leaf))
        );
        if (!noneValid) {
            errors.push({
                test: tag,
                message: `None of ${JSON.stringify(tag.none)} should be present.`
            });
        }
    } else if (tag.if) {
        // { if: {criteria: 'some|all' condition: [], then: [], else: [] } }
        const criteria = tag.if.criteria || "some";
        const conditionMet = tag.if.condition[criteria](
            (cond) =>
                (!cond.branch ||
                    (branches.has(cond.branch) && branches.get(cond.branch).includes(cond.leaf))) &&
                (!cond.leaf || (leafs.has(cond.leaf) && leafs.get(cond.leaf).includes(cond.branch)))
        );

        const tagsToValidate = conditionMet ? tag.if.then : tag.if.else;

        if (tagsToValidate) {
            tagsToValidate.forEach((nestedTag) => {
                const nestedErrors = validateTags(branches, leafs, nestedTag);
                // add the path to the errors
                errors.push(...nestedErrors);
            });
        }
    } else {
        // { branch: "verbform" },
        // equivalent to has
        if (tag.branch && !branches.has(tag.branch)) {
            errors.push({ test: tag, message: `Missing branch: '${tag.branch}'` });
        }
        if (tag.leaf && !leafs.has(tag.leaf)) {
            errors.push({ test: tag, message: `Missing leaf: '${tag.leaf}'` });
        }
    }

    return errors;
}

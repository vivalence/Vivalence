export const sortByPerformer = (a, b) => {
    const sumSortValues = (unit) =>
        unit.tags.reduce((sum, tag) => {
            const { leaf, branch } = tag.data.ONTOLOGICAL;
            if (branch === "person") return sum + parseInt(leaf);
            if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
            return sum;
        }, 0);

    return sumSortValues(a) - sumSortValues(b);
};

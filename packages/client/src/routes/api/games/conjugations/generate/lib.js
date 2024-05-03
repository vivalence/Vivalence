export const sortByPerformer = (a, b) => {
    const sumSortValues = (unit) =>
        unit.tags.reduce((sum, tag) => {
            const { leaf, branch } = tag.data.ONTOLOGICAL;
            if (branch === "Person") return sum + parseInt(leaf);
            if (branch === "Number") return leaf === "Sing" ? sum + 0 : sum + 10;
        }, 0);
    return sumSortValues(a) - sumSortValues(b);
};

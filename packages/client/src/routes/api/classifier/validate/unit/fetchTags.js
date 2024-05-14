export default async function (unitId, locals) {
    const { data, error } = await locals.supabase
        .from("Unit")
        .select(`*, _TagToUnit(*, Tag: A (*))`)
        .eq("id", unitId)
        .single();

    if (error) {
        throw new Error("Error fetching tags from database: " + error.message);
    }

    const tags = data._TagToUnit.map(({ Tag }) => Tag);
    const branches = new Map();
    const leafs = new Map();

    tags.forEach((tag) => {
        const branch = tag.data.ONTOLOGICAL?.branch;
        const leaf = tag.data.ONTOLOGICAL?.leaf;

        if (branch) {
            branches.set(branch, (branches.get(branch) || []).concat(leaf));
        }
        if (leaf) {
            leafs.set(leaf, (leafs.get(leaf) || []).concat(branch));
        }
    });

    return { branches, leafs };
}

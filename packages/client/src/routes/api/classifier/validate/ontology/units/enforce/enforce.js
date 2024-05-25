const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ({}, locals) {
    const { supabase, post } = locals;

    const units = await (async function getUnits({}) {
        // const { data: tag, error } = await supabase .from("Tag") .select(`*, _TagToUnit(*, Unit: B (*))`) .eq(`data->ONTOLOGICAL->>branch`, branch) .eq(`data->ONTOLOGICAL->>leaf`, leaf) .single();
        // const units = tag._TagToUnit.map((r) => r.Unit).sort((a, b) => a.createdAt - b.createdAt);

        const { data: units, error } = await supabase.from("Unit").select(`*`);
        // .eq("id", "clpl45wby009bg0s3y8exjjzd");

        const promises = units.map(async function (unit) {
            await sleep(Math.floor(Math.random() * 2 * units.length));

            const { data, error } = await supabase
                .from("Unit")
                .select(`*, _TagToUnit(*, Tag: A (*))`)
                .eq("id", unit.id)
                .single();
            if (error) throw error;

            unit.tags = data._TagToUnit.map((r) => r.Tag);
            return unit;
        });
        return await Promise.all(promises);
    })({});

    const issues = await (async function validateUnits(units) {
        const promises = units.map(async function (unit) {
            const { data, error } = await post("/api/classifier/validate/unit", {
                unit
            });
            if (error) throw error;
            return data.issues;
        });
        let unitIssues = await Promise.all(promises);

        unitIssues = unitIssues
            .flat()
            .filter((i) => i)
            .filter((issue) => issue.violation !== "conditional")
            .sort((a, b) => {
                const order = ["mismatch", "forbidden", "unique", "required", "ivalid"];
                return order.indexOf(a.violation) - order.indexOf(b.violation);
            });

        return unitIssues;
    })(units);

    return issues;
}

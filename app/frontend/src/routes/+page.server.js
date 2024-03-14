export const load = async ({ locals: { supabase }, ...params }) => {
    let { data: strategies, error } = await supabase.from("Strategy").select("*");

    return {
        strategies
    };
};

export const load = async ({ locals: { supabase }, ...params }) => {
    const start = performance.now();
    let { data: strategies, error } = await supabase
        .from("Strategy")
        .select(`*, _StrategyToTag (A, B, Tag (id, name, type))`);
    if (error) console.error(error);

    const getStats = getStrategyStatistics(supabase);

    strategies = await Promise.all(
        strategies.map(async (strategy) => {
            const statistics = await getStats(strategy);
            return { ...strategy, statistics };
        })
    );

    return { strategies, time: performance.now() - start };
};

export const getStrategyStatistics = (supabase) => async (strategy) => {
    try {
        const input = {
            tag_ids: strategy._StrategyToTag
                .filter(({ Tag }) => Tag.type.includes("STRUCTURAL"))
                .map(({ B }) => B)
        };

        const { data, error } = await supabase.rpc("get_memory_status_statistics_on_tags", input);
        if (error) throw error;

        const statistics = data.reduce(
            (
                acc,
                { status_unknown, no_memory, status_learning, status_known, status_graduated }
            ) => {
                acc.unknown += status_unknown + no_memory;
                acc.learning += status_learning;
                acc.known += status_known + status_graduated;
                acc.total = acc.unknown + acc.learning + acc.known;

                return acc;
            },
            { unknown: 0, learning: 0, known: 0, total: 0 }
        );

        if (statistics.total === 0) {
            // @lj UI heuristic
            statistics.total = 1;
            statistics.unknown = 1;
        }

        return statistics;
    } catch (error) {
        console.error(error);
        return { unknown: 0, learning: 0, known: 0, total: 0 };
    }
};

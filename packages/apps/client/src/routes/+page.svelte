<script>
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { ProgressBar } from "@skeletonlabs/skeleton";
    import LineChart from "$components/charts/Line.svelte";

    const Statistics = writable({});

    export let data;
    let { locals } = data;
    const supabase = locals.supabase;

    const chartMapping = {
        unknown: { label: "Unknown", color: "bg-error-400", class: "unknown" },
        learning: { label: "Learning", color: "bg-secondary-400", class: "learning" },
        known: { label: "Mastered", color: "bg-success-400", class: "known" }
    };

    onMount(async () => {
        const getStats = async (strategy) => {
            try {
                const input = {
                    tag_ids: strategy._StrategyToTag
                        .filter(({ Tag }) => Tag.type.includes("STRUCTURAL"))
                        .map(({ B }) => B)
                };

                const { data, error } = await supabase.rpc(
                    "get_memory_status_statistics_on_tags",
                    input
                );
                if (error) throw error;

                const statistics = data.reduce(
                    (
                        acc,
                        {
                            status_unknown,
                            no_memory,
                            status_learning,
                            status_known,
                            status_graduated
                        }
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

                const result = Object.keys(chartMapping).map((key, index) => ({
                    label: `${statistics[key]} ${chartMapping[key].label}`,
                    number: statistics[key],
                    index: index,
                    class: chartMapping[key].class,
                    color: chartMapping[key].color
                }));
                return result;
            } catch (error) {
                console.error(error);
                return [{ label: "", number: 0, index: 0, class: "", color: "" }];
            }
        };
        for (const strategy of data.strategies) {
            const stats = await getStats(strategy);
            Statistics.update((s) => ({ ...s, [strategy.id]: stats }));
        }
    });
</script>

<div class="container mx-auto mt-20 sm:px-20 md:px-40 xl:px-80">
    {#if data.strategies}
        {#each data.strategies as strategy}
            <div class="card mb-2 p-2">
                <header class="card-header flex flex-nowrap flex-auto">
                    <a href="/strategy/{strategy.id}">
                        <div>
                            <span class="text-lg font-medium tracking-wide">{strategy.name}</span>
                        </div>
                    </a>
                    <div class="grow" />
                    <a href="/strategy/{strategy.id}">
                        <button class="btn variant-ghost btn-sm"> info </button>
                    </a>
                </header>
                <section class="p-4 s">
                    {#if $Statistics[strategy.id]}
                        <a href="/strategy/{strategy.id}">
                            <LineChart data={$Statistics[strategy.id]} />
                        </a>
                    {/if}
                </section>
            </div>
        {/each}
    {:else}
        <p>No strategies</p>
    {/if}
</div>

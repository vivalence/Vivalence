<script>
    import { ProgressBar } from "@skeletonlabs/skeleton";
    import LineChart from "$components/charts/Line.svelte";
    export let data;
    const strategies = data.strategies;

    const chartMapping = {
        unknown: { label: "Unknown", color: "bg-error-400", class: "unknown" },
        learning: { label: "Learning", color: "bg-secondary-400", class: "learning" },
        known: { label: "Mastered", color: "bg-success-400", class: "known" }
    };

    const mapStatisticsToLineChart = (statistics) =>
        Object.keys(chartMapping).map((key, index) => ({
            label: chartMapping[key].label,
            number: statistics[key],
            index: index,
            class: chartMapping[key].class,
            color: chartMapping[key].color
        }));
</script>

<div class="container mx-auto mt-20 sm:px-20 md:px-40 xl:px-80">
    {#if strategies}
        {#each strategies as strategy}
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
                    <a href="/strategy/{strategy.id}">
                        <LineChart data={mapStatisticsToLineChart(strategy.statistics)} />
                    </a>
                </section>
            </div>
        {/each}
    {:else}
        <p>No strategies</p>
    {/if}
</div>

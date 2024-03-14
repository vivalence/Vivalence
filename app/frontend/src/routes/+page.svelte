<script>
    export let data;
    const strategies = data.strategies;
</script>

{#if strategies}
    {#each strategies as strategy}
        <h1>{strategy.name}</h1>
        <a href="/strategy/{strategy.id}"> play </a>
    {/each}
{:else}
    <p>No strategies</p>
{/if}

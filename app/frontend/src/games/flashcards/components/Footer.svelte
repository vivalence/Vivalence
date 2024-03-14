<script>
    import store from "../store.js";
    // import Button from "$kit/button/Button.svelte"; import FlexContainer from "$kit/flex/Container.svelte"; import FlexItem from "$kit/flex/Item.svelte"; import { flashcardsStore } from "../store.js"; // assuming you export it with this name

    const containerClasses = "border rounded-xl bg-theme-ui-3 border-theme-border-2 p-2";
</script>

{#if !$store.revealed}
    <button on:click={() => store.reveal()}>Reveal</button>
{:else}
    <button on:click={() => store.review("UNKNOWN")}>Unknown</button>
    <button on:click={() => store.review("KNOWN")}>Known</button>
    <button on:click={() => store.review("GRADUATE")}>Graduate</button>
{/if}

<!-- <FlexContainer items="center" justify="center" classes="fixed bottom-0 w-full h-20 bg-theme-ui-2"> -->
<!--     {#if !$flashcardsStore.revealed} -->
<!--         <FlexItem classes={containerClasses}> -->
<!--             <Button size="xl" on:click={() => flashcardsStore.reveal()}>Reveal</Button> -->
<!--         </FlexItem> -->
<!--     {:else} -->
<!--         <FlexItem classes={containerClasses}> -->
<!--             <Button size="xl" hierarchy="primary" outlined on:click={handleReview("UNKNOWN")} -->
<!--                 >Unknown</Button -->
<!--             > -->
<!--             <Button size="xl" hierarchy="primary" on:click={handleReview("KNOWN")}>Knew</Button> -->
<!--             <Button size="xl" hierarchy="accent" on:click={handleReview("GRADUATE")} -->
<!--                 >Graduate</Button -->
<!--             > -->
<!--         </FlexItem> -->
<!--     {/if} -->
<!-- </FlexContainer> -->

<script>
    import { flashcardsStore } from "../store.js"; // assuming you export it with this name
    import Button from "../../../../../kit/button/Button.svelte";
    import FlexContainer from "../../../../../kit/flex/Container.svelte";
    import FlexItem from "../../../../../kit/flex/Item.svelte";
    const handleReview = (review) => () => flashcardsStore.review(review);
</script>

<FlexContainer items="center" justify="center" classes="fixed bottom-0 w-full h-20 bg-theme-ui-2">
    {#if !$flashcardsStore.revealed}
        <FlexItem>
            <Button size="xl" on:click={() => flashcardsStore.reveal()}>Reveal</Button>
        </FlexItem>
    {:else}
        <FlexItem>
            <Button size="xl" hierarchy="destructive" on:click={handleReview("UNKNOWN")}
                >Unknown</Button
            >
            <Button size="xl" hierarchy="primary" on:click={handleReview("KNOWN")}>Knew</Button>
            <Button size="xl" hierarchy="accent" on:click={handleReview("GRADUATE")}
                >Graduate</Button
            >
        </FlexItem>
    {/if}
</FlexContainer>

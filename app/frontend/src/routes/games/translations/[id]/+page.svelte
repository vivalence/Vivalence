<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";

    import TranslationInput from "./components/TranslationsInput.svelte";
    // import TranslationReview from "./components/TranslationReview.svelte";
    // import Controls from "./components/Controls.svelte";

    import { gameStore } from "./store.js";

    onMount(async () => {
        gameStore.init({ gameId: $page.params.id });
    });
</script>

<FlexContainer
    items="center"
    justify="center"
    classes=" h-full h-max w-full lg:mt-32 md:mt-20 mt-12"
>
    <FlexItem>
        {#if $gameStore.sentence && !$gameStore.revealed}
            <TranslationInput />
            <!-- {:else if $translationsStore.revealed} -->
            <!--     <TranslationReview /> -->
            <!-- {:else} -->
            <!--     <\!-- <Loading/> -\-> -->
            <!--     <h1>loading</h1> -->
        {/if}
    </FlexItem>
</FlexContainer>

<!-- <Controls /> -->
<!-- {#if $translationsStore.revealed && $translationsStore.sentence} -->
<!--     <NextSentenceCard /> -->
<!-- {/if} -->

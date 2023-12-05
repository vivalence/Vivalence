<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";

    import TranslationsInput from "./components/TranslationsInput.svelte";
import TranslationsReview from "./components/TranslationsReview.svelte";
    // import Controls from "./components/Controls.svelte";

    import { gameStore } from "./store.js";

    onMount(async () => {
        gameStore.init({ gameId: $page.params.id });
    });
    $: console.log($gameStore);
  // display error
</script>

<FlexContainer
    items="center"
    justify="center"
    classes=" h-full h-max w-full lg:mt-32 md:mt-20 mt-12"
>
    <FlexItem>
        {#if $gameStore.sentence && !$gameStore.revealed}
            <TranslationsInput />
        {:else if $gameStore.revealed}
            <TranslationsReview />

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

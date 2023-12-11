<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import Loader from "$kit/loader/Loader.svelte";
    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";

    import TranslationsInput from "./components/TranslationsInput.svelte";
    import TranslationsReview from "./components/TranslationsReview.svelte";
    import NextSentence from "./components/NextSentence.svelte";

    import { gameStore } from "./store.js";

    onMount(async () => {
        gameStore.init({ gameId: $page.params.id });
    });
    // display error

    // <!-- $: console.log(''); -->
    // <!-- $: console.log($gameStore.sentence); -->
    // <!-- $: console.log($gameStore.review); -->
</script>

<FlexContainer
    items="center"
    justify="center"
    classes=" h-full h-max w-full lg:mt-18 md:mt-12 mt-8 pb-32"
>
    <FlexItem>
        {#if $gameStore.sentence && !$gameStore.revealed}
            <TranslationsInput />
        {:else if $gameStore.revealed}
            <TranslationsReview />
        {:else}
            <Loader />
        {/if}
    </FlexItem>
</FlexContainer>

{#if $gameStore.revealed && $gameStore.sentence}
    <NextSentence/>
{/if}

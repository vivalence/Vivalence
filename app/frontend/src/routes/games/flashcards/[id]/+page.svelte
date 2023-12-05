<script>
    import { page } from "$app/stores";
    import { pan } from "svelte-gestures";
    import { onMount, onDestroy } from "svelte";
    import { spring } from "svelte/motion";

    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";

    import Card from "./components/Card.svelte";
    import Controls from "./components/Controls.svelte";
    import Panable from "./components/PanAble.svelte";

    import { flashcardsStore } from "./store.js";

    export let data;
    $: ({ GetCards } = data);
    let seeded = false;

    $: if (!seeded && $GetCards.data && $GetCards.data.Game_Flashcards_GetCards) {
        seeded = true;
        flashcardsStore.init({
            cards: $GetCards.data.Game_Flashcards_GetCards,
            gameId: $page.params.id
        });
    }
</script>

<Panable>
    {#if $flashcardsStore.current}
        <FlexContainer
            items="center"
            justify="center"
            classes=" h-full h-max w-full lg:mt-32 md:mt-20 mt-12"
        >
            <FlexItem>
                <Card />
            </FlexItem>
        </FlexContainer>
    {/if}
</Panable>
<Controls />

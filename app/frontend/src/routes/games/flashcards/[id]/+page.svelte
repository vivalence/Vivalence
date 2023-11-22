<script>
    import { page } from "$app/stores";

    import FlexContainer from "../../../../kit/flex/Container.svelte";
    import FlexItem from "../../../../kit/flex/Item.svelte";

    import Card from "./components/Card.svelte";
    import Controls from "./components/Controls.svelte";
    import { flashcardsStore } from "./store.js"; 

    export let data;
    $: ({ GetCards  } = data);
    let seeded = false;

    $: if (!seeded && $GetCards.data && $GetCards.data.Game_Flashcards_GetCards) {
        seeded = true;
        flashcardsStore.init({
            cards: $GetCards.data.Game_Flashcards_GetCards,
            gameId: $page.params.id
        });
    }
</script>

{#if $flashcardsStore.current}
    <FlexContainer items="center" justify="center" classes="w-full lg:mt-32 md:mt-20 mt-12">
        <FlexItem>
            <Card />
        </FlexItem>
    </FlexContainer>
{/if}
<Controls />


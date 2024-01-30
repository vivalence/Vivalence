<script>
    import { page } from "$app/stores";

    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";

    import Card from "./components/Card.svelte";
    import Controls from "./components/Controls.svelte";
    import Panable from "./components/PanAble.svelte";

    import { flashcardsStore } from "./store.js";

    // export let data;
    // $: ({ GetCards } = data);
    // let seeded = false;


    // $: if (!seeded && $GetCards.data && $GetCards.data.Game_Flashcards_GetCards) {
    //     console.log("cards", seeded, $GetCards.data);
    //     seeded = true;
    //     flashcardsStore.init({
    //         cards: $GetCards.data.Game_Flashcards_GetCards,
    //         gameId: $page.params.id
    //     });
    // }
    // $: console.log("flashcardsStore", $flashcardsStore);
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

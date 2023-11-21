<script>
    import { page } from "$app/stores";

    import FlexContainer from "../../../../kit/flex/Container.svelte";
    import FlexItem from "../../../../kit/flex/Item.svelte";

    import Card from "./components/Card.svelte";
    import Controls from "./components/Controls.svelte";
    import { flashcardsStore } from "./store.js"; // assuming you export it with this name

    export let data;
    $: ({ FlashcardsInit } = data);
    let seeded = false;

    $: if (!seeded && $FlashcardsInit.data && $FlashcardsInit.data.flashcardsInit) {
        seeded = true;
        flashcardsStore.init({
            cards: $FlashcardsInit.data.flashcardsInit.gamePlayStateUpdate.newCards,
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

<!-- <div class="text-palette-white">{JSON.stringify($FlashcardsInit, null, 2)}</div> -->

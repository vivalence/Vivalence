<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import flashcardsStore from "$games/flashcards/store.js";
    import FlashcardsGame from "$games/flashcards/flashcards.svelte";

    onMount(async () => {
        await flashcardsStore.init({ gameId: $page.params.id });
    });

</script>

<FlashcardsGame />

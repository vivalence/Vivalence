<script>
    import { page } from "$app/stores";

    import Translations from "$games/translations/Translations.svelte";
    import Flashcards from "$games/flashcards/Flashcards.svelte";
    import Conjugations from "$games/conjugations/Conjugations.svelte";

    import Loader from "./components/Loader.svelte";
    import store from "./store.js";

    const games = {
        CONJUGATIONS: Conjugations,
        FLASHCARDS: Flashcards,
        TRANSLATIONS: Translations
    };

    const onGameFinish = (payload) => {
        store.next();
    };
    // $: console.log($store);
</script>

{#if !$store.error && !!$store.active}
    <svelte:component
        this={games[$store.active?.data.type]}
        on:finish={onGameFinish}
        {...$store.active?.data}
    />
{:else if !$store.error && $store.status === 202}
    <Loader />
{:else if $store.error}
    <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

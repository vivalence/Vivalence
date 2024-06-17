<script>
    import { page } from "$app/stores";
    import spanish from "@vivalence/ontologies-spanish";

    import Loader from "./components/Loader.svelte";
    import store from "./store.js";

    // const games = {CONJUGATIONS: spanish.games.Conjugations, FLASHCARDS: spanish.games.Flashcards, TRANSLATIONS: spanish.games.Translations};
    const games = Object.fromEntries(
        Object.entries(spanish.games).map(([key, value]) => ({
          [key.toUpperCase()]: value.default,
        })))

    const onGameFinish = (payload) => {
        store.next();
    };
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

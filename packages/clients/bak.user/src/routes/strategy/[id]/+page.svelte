<script>
    import spanish from "@vivalence/ontologies-spanish";

    import Loader from "./components/Loader.svelte";
    import { createStore } from "./store.js";

    export let data;
    const { locals, params } = data;

    const store = createStore({ strategyId: params.id, locals });
    locals.onGameFinish = store.next;

    const games = Object.entries(spanish.games).reduce(
        (acc, [name, game]) => ({ ...acc, [name.toUpperCase()]: game }),
        {}
    );

</script>

{#if !$store.error && !!$store.active}
    <svelte:component this={games[$store.active?.data.type]} {...$store.active?.data} {locals} />
{:else if !$store.error}
    <Loader />
{:else if $store.error}
    <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

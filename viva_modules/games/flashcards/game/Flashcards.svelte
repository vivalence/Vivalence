<script>
    import { getContext, onDestroy, onMount } from "svelte";

    import Panable from "./components/Panable.svelte";
    import Card from "./components/Card.svelte";
    import Footer from "./components/Footer.svelte";

    import { createStore } from "./store.js";

    export let locals;
    export let scope;
    export let instruction;

    const store = createStore({ locals });

    const pageFooterContext = getContext("page-footer");

    onMount(() => pageFooterContext.set(Footer));
    onDestroy(() => pageFooterContext.set(null));

    $: if (scope && instruction) {
        store.update((s) => ({ ...s, revealed: false, loading: false, scope, instruction }));
    }

    const onReview = (status) => () => store.review(status);

    // $: console.log('Flashcards',$store);
</script>

<div class="h-full v-game-container">
    <Panable
        on:left={onReview("UNKNOWN")}
        on:right={onReview("KNOWN")}
        on:up={onReview("GRADUATE")}
        on:tap={store.reveal}
    >
        <div class="flex items-center justify-center h-full v-game-content">
            <div class="basis-auto">
                {#if !$store.loading}
                    <Card />
                {/if}
            </div>
        </div>
    </Panable>
</div>

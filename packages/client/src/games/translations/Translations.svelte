<script>
    import { page } from "$app/stores";
    import { createEventDispatcher } from "svelte";
    import { getContext, onDestroy, onMount } from "svelte";

    import Prompt from "./components/Prompt.svelte";
    import Review from "./components/Review.svelte";
    import Footer from "./components/Footer.svelte";
    import store from "./store.js";

    const dispatch = createEventDispatcher();
    const pageFooterContext = getContext("page-footer");
    onMount(() => {
        pageFooterContext.set(Footer);
        store.update((s) => ({ ...s, input: "", onFinish: (p) => dispatch("finish", p) }));
    });
    onDestroy(() => {
        pageFooterContext.set(null);
    });

    export let payload;
    export let instructions;

    $: if (payload && instructions) {
        store.update((s) => ({ ...s, payload, instructions }));
    }
</script>

<section class="container mx-auto sm:px-6 md:px-20 mt-20">
    <div class="card variant-soft px-12 pt-6 pb-10 rounded-container-token">
        {#if $store.instructions && !$store.revealed}
            <Prompt />
        {:else if $store.instructions && $store.revealed}
            <Review />
        {/if}
    </div>
</section>

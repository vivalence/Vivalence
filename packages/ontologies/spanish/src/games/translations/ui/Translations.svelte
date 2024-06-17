<script>
    import { page } from "$app/stores";
    import { bindKey, unbindKey } from "@rwh/keystrokes";
    import { createEventDispatcher, tick } from "svelte";
    import { getContext, onDestroy, onMount } from "svelte";

    import Prompt from "./components/Prompt.svelte";
    import Review from "./components/Review.svelte";
    import Footer from "./components/Footer.svelte";
    import store from "./store.js";

    const dispatch = createEventDispatcher();
    const pageFooterContext = getContext("page-footer");

    const keymap = {
        Enter: () => (!$store.revealed ? store.commitTranslation() : store.finishTranslation())
    };

    onMount(async () => {
        pageFooterContext.set(Footer);
        await tick();
        store.update((s) => ({ ...s, input: "", onFinish: (p) => dispatch("finish", p) }));
        Object.keys(keymap).forEach((key) => bindKey(key, keymap[key]));
    });
    onDestroy(() => {
        pageFooterContext.set(null);
        Object.keys(keymap).forEach((key) => unbindKey(key, keymap[key]));
    });

    export let scope;
    export let instruction;

    $: if (scope && instruction) {
        store.update((s) => ({ ...s, scope, instruction }));
    }
</script>

<section class="container mx-auto sm:px-6 md:px-20 mt-20">
    <div class="card variant-soft px-12 pt-6 pb-10 rounded-container-token">
        {#if $store.instruction && !$store.revealed}
            <Prompt />
        {:else if $store.instruction && $store.revealed}
            <Review />
        {/if}
    </div>
</section>

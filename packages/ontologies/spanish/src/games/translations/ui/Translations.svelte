<script>
    import { page } from "$app/stores";
    import { bindKey, unbindKey } from "@rwh/keystrokes";
    import { tick } from "svelte";
    import { getContext, onDestroy, onMount } from "svelte";

    import Prompt from "./components/Prompt.svelte";
    import Review from "./components/Review.svelte";
    import Footer from "./components/Footer.svelte";
    import { createStore } from "./store.js";

    export let locals;
    export let scope;
    export let instruction;

    const store = createStore({ locals });

    const pageFooterContext = getContext("page-footer");
    const keymap = {
        Enter: () => (!$store.revealed ? store.commitTranslation() : store.finishTranslation())
    };

    onMount(async () => {
        pageFooterContext.set(Footer);
        await tick();
        Object.keys(keymap).forEach((key) => bindKey(key, keymap[key]));
    });
    onDestroy(() => {
        pageFooterContext.set(null);
        Object.keys(keymap).forEach((key) => unbindKey(key, keymap[key]));
    });

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

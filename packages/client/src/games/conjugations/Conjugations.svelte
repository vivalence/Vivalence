<script>
    import { onMount, onDestroy, getContext, tick } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { bindKey, unbindKey } from "@rwh/keystrokes";
    import store from "./store.js";

    import Prompt from "./components/Prompt.svelte";
    import Table from "./components/Table.svelte";
    import Footer from "./components/Footer.svelte";

    const dispatch = createEventDispatcher();
    const pageFooterContext = getContext("page-footer");
    const keymap = {
        Enter: () => (!$store.revealed ? store.evaluate() : store.finish())
    };

    onMount(async () => {
        pageFooterContext.set(Footer);
        await tick();
        store.update((s) => ({ ...s, input: "", onFinish: (p) => dispatch("finish", p) }));
        Object.keys(keymap).forEach((key) => bindKey(key, keymap[key]));
    });

    onDestroy(() => {
        pageFooterContext.set(null);
        Object.keys(keymap).forEach((key) => unbindKey(key));
    });

    export let payload;
    export let instruction;

    $: if (instruction && payload) {
        store.update((s) => ({ ...s, instruction, payload }));
    }
</script>

<section class="container mx-auto sm:px-6 md:px-20 mt-20 pb-10">
    <div class="card variant-soft px-12 pt-6 pb-10 rounded-container-token">
        {#if $store.instruction}
            <Prompt />
            <Table />
        {/if}
    </div>
</section>

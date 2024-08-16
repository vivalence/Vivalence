<script>
    import { onMount, onDestroy, getContext, tick } from "svelte";
    // import { bindKey, unbindKey } from "@rwh/keystrokes";

    import { createStore } from "./store.js";
    import Prompt from "./components/Prompt.svelte";
    import Table from "./components/Table.svelte";
    import Footer from "./components/Footer.svelte";

    export let locals;
    export let scope;
    export let instruction;

    const store = createStore({ locals });

    // const pageFooterContext = getContext("page-footer");
    // const keymap = {
    //     Enter: () => (!$store.revealed ? store.evaluate() : store.finish())
    // };
    // onMount(async () => {
    //     pageFooterContext.set(Footer);
    //     await tick();
    //     Object.keys(keymap).forEach((key) => bindKey(key, keymap[key]));
    // });
    // onDestroy(() => {
    //     pageFooterContext.set(null);
    //     Object.keys(keymap).forEach((key) => unbindKey(key));
    // });

    $: if (instruction && scope) {
        store.update((s) => ({ ...s, instruction, scope }));
    }
</script>

<section class="container mx-auto sm:px-6 md:px-20 mt-12 mb-20">
    <div class="card variant-soft px-12 pt-6 pb-10 rounded-container-token">
        {#if $store.instruction}
            <Prompt />
            <Table />
        {/if}
    </div>
</section>

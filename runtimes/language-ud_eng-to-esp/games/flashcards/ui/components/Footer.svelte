<script>
    import { onMount, onDestroy } from "svelte";
    import { bindKey, unbindKey } from "@rwh/keystrokes";

    import { getStore } from "../store.js";
    const store = getStore();

    const keymap = {
        " ": () => ($store.revealed ? store.review("KNOWN") : store.reveal()),
        "1": () => $store.revealed && store.review("UNKNOWN"),
        "2": () => $store.revealed && store.review("KNOWN"),
        "3": () => $store.revealed && store.review("GRADUATE")
    };
    onMount(() => {
        Object.keys(keymap).forEach((key) => bindKey(key, keymap[key]));
    });
    onDestroy(() => {
        Object.keys(keymap).forEach((key) => unbindKey(key, keymap[key]));
    });

    const containerClasses = "border rounded-xl bg-theme-ui-3 border-theme-border-2 p-2";
</script>

<footer class="fixed bottom-0 w-full p-4 bg-gray-800">
    <div class="flex justify-center space-x-2">
        {#if !$store.revealed}
            <button class="btn variant-ghost" on:click={() => store.reveal()}>Reveal</button>
        {:else}
            <button class="btn variant-ghost" on:click={() => store.review("UNKNOWN")}
                >Unknown</button
            >
            <button class="btn variant-ghost" on:click={() => store.review("KNOWN")}>Known</button>
            <button class="btn variant-ghost" on:click={() => store.review("GRADUATE")}
                >Graduate</button
            >
        {/if}
    </div>
</footer>

<!-- {#if !$store.revealed} -->
<!--     <button >Reveal</button> -->
<!-- {:else} -->
<!--     <button on:click={() => store.review("UNKNOWN")}>Unknown</button> -->
<!--     <button on:click={() => store.review("KNOWN")}>Known</button> -->
<!--     <button on:click={() => store.review("GRADUATE")}>Graduate</button> -->
<!-- {/if} -->

<!-- <FlexContainer items="center" justify="center" classes="fixed bottom-0 w-full h-20 bg-theme-ui-2"> -->
<!--     {#if !$flashcardsStore.revealed} -->
<!--         <FlexItem classes={containerClasses}> -->
<!--             <Button size="xl" on:click={() => flashcardsStore.reveal()}>Reveal</Button> -->
<!--         </FlexItem> -->
<!--     {:else} -->
<!--         <FlexItem classes={containerClasses}> -->
<!--             <Button size="xl" hierarchy="primary" outlined on:click={handleReview("UNKNOWN")} -->
<!--                 >Unknown</Button -->
<!--             > -->
<!--             <Button size="xl" hierarchy="primary" on:click={handleReview("KNOWN")}>Knew</Button> -->
<!--             <Button size="xl" hierarchy="accent" on:click={handleReview("GRADUATE")} -->
<!--                 >Graduate</Button -->
<!--             > -->
<!--         </FlexItem> -->
<!--     {/if} -->
<!-- </FlexContainer> -->

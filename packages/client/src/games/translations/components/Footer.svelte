<script>
    import store from "../store.js";
    import { onMount, onDestroy } from "svelte";
    import { bindKey, unbindKey } from "@rwh/keystrokes";

    const onClick = () => {
        $store.onFinish();
        store.update((s) => ({ ...s, revealed: false, input: "" }));
    };

    const keymap = {Enter: onClick};
    onMount(() => Object.keys(keymap).forEach((key) => bindKey(key, keymap[key])));
    onDestroy(() => Object.keys(keymap).forEach((key) => unbindKey(key, keymap[key])));
</script>

<footer class="fixed bottom-0 w-full p-4 bg-gray-800">
    {#if $store.revealed}
        <div class="flex justify-center">
            <button class="btn variant-filled" on:click={onClick}> Next </button>
        </div>
    {/if}
</footer>

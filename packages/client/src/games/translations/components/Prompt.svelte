<script>
    import { onMount, onDestroy } from "svelte";
    import { bindKey, unbindKey } from "@rwh/keystrokes";

    import store from "../store.js";

    const keymap = {
        " ": commit,
        Enter: commit,
    };
    onMount(() => Object.keys(keymap).forEach((key) => bindKey(key, keymap[key])));
    onDestroy(() => Object.keys(keymap).forEach((key) => unbindKey(key, keymap[key])));

    const commit = () => {
        store.setRevealed(true);
        store.evaluate();
    };

    const handleInput = (event) => {
        store.setInput(event.target.value);
    };
</script>

<div class="my-4">
    <div class="">
    <p class="text-center text-3xl">
        {$store.instructions.spoken}
    </p>
    </div>
    <div class="flex items-center justify-center mt-6 ">
        <input
            class={`border input`}
            type="text"
            bind:value={$store.input}
            on:input={handleInput}
        />

        <button on:click={commit} class="btn variant-filled" type="button">Check</button>
    </div>
</div>

<style>
</style>

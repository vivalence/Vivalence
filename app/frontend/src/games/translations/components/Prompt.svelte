<script>
    import { onMount, onDestroy } from "svelte";

    import store from "../store.js";

    const commit = () => {
        store.setRevealed(true);
        store.evaluate();
    };

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            commit();
        }
    }

    onMount(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", handleKeyDown);
        }
    });
    onDestroy(() => {
        if (typeof window !== "undefined") {
            window.removeEventListener("keydown", handleKeyDown);
        }
    });

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

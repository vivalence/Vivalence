<script>

    import store from "../store.js";

    const handleInput = (event) => store.setInput(event.target.value);
</script>

<div class="my-4">
    <div class="">
        <p class="text-center text-3xl">
            {$store.instruction.sentence.spoken}
        </p>
    </div>
    <div class="flex items-center justify-center mt-6">
        <input
            class={`border input`}
            type="text"
            bind:value={$store.input}
            on:input={handleInput}
        />

        <button on:click={store.commitTranslation} class="btn variant-filled" type="button"
            >Check</button
        >
    </div>
</div>

<style>
</style>

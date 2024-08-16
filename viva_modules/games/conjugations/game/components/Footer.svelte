<script>
    import { getStore } from "../store.js";
    const store = getStore();
</script>

<footer class="fixed bottom-0 w-full p-4 bg-gray-800">
    <div class="flex justify-center space-x-2">
        {#if !$store.revealed}
            <div class="flex justify-center">
                <button class="btn variant-filled" on:click={store.evaluate}> Check </button>
            </div>
        {:else}
            <div class="flex justify-center">
                <button class="btn variant-filled" on:click={store.finish}>next</button>
            </div>
        {/if}
    </div>
</footer>

<script>
    import store from "../store.js";
</script>

<footer class="fixed bottom-0 w-full p-4 bg-gray-800">
    {#if $store.revealed}
        <div class="flex justify-center">
            <button class="btn variant-filled" on:click={store.finishTranslation}> Next </button>
        </div>
    {/if}
</footer>

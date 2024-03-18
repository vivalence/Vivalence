<script>
    import store from "../store.js";

    const onClick = () => {
        console.log("clicked");
        $store.onFinish();
        store.update((s) => ({ ...s, revealed: false, input: "" }));
    };
</script>

<footer class="fixed bottom-0 w-full p-4 bg-gray-800">
    {#if $store.revealed}
        <div class="flex justify-center">
            <button class="btn variant-filled" on:click={onClick}> Next </button>
        </div>
    {/if}
</footer>

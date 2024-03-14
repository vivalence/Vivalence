<script>
    import store from "../store.js";
    const onClick = () => {
        $store.onFinish();
        store.update((s) => ({ ...s, revealed: false, input: "" }));
    };
</script>

{#if $store.revealed}
    <div class="mb-6 flex justify-center">
        <button class="button variant-filled" on:click={onClick}> Next </button>
    </div>
{/if}

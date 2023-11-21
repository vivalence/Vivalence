<script>
    import { flashcardsStore } from "../store.js";
</script>

<div class="font-inherit text-theme-text-1 font-sans-text">
    <div class="bg-theme-ui-1 w-80 min-h-[12em] p-8 mb-3 rounded shadow-sm">
        {@html $flashcardsStore.current.front}
    </div>
    {#if $flashcardsStore.revealed}
        <div class="bg-theme-ui-2 w-80 min-h-[12em] p-8 mb-3 rounded shadow-sm">
            {@html $flashcardsStore.current.back}
        </div>
    {/if}
</div>

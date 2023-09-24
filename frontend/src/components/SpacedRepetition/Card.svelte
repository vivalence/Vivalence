<script>
    export let revealed;
    export let front;
    export let back;
</script>

<!-- A tailwind css Card component displaying revealed ? front & back : front -->
<!-- Front of the Card -->
<div class="min-h-[12em] p-12 mb-3 bg-white rounded shadow-sm text-center">
    <p class="text-3xl font-bold leading-3">{front}</p>
</div>
{#if revealed}
    <div class="min-h-[12em] p-12 bg-white rounded shadow-sm text-center">
        <p class="text-3xl font-bold leading-3">{back}</p>
    </div>
{/if}

<script>
    export let revealed;
    export let front;
    export let back;
</script>

<!-- A tailwind css Card component displaying revealed ? front & back : front -->
<!-- Front of the Card -->
<div class="min-h-[12em] p-8  mb-3 bg-white rounded shadow-sm ">
    {@html front}
</div>
{#if revealed}
    <div class="min-h-[12em] p-8  bg-white rounded shadow-sm ">
    {@html back}
    </div>
{/if}

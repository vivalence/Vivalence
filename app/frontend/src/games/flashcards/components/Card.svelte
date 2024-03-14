<script>
    import store from "../store.js";

    let rounded, classesFront, classesBack, classesContainer;
    $: rounded = `rounded-t-token ${!$store.revealed && "rounded-b-token"}`;
    $: classesFront = `front ${rounded} bg-surface-900-50-token text-primary-50-900-token`;
    $: classesBack = `back rounded-b-token bg-surface-200-700-token text-primary-900-50-token`;
    $: classesContainer = `v-card`;

</script>

<div class={classesContainer}>
    <div class={classesFront}>
        {@html $store.instructions.front}
    </div>
    {#if $store.revealed}
        <div class={classesBack}>
            {@html $store.instructions.back}
        </div>
    {/if}
    <h1></h1>
    <p></p>
</div>

<style>
    .v-card {
        @apply rounded-token border-token;
    }
    .front {
        @apply w-80 min-h-[10em] py-6 px-8;
    }
    .back {
        @apply w-80 min-h-[10em] py-6 px-8;
    }
</style>

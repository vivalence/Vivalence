<script>
    import { getStore } from "../store.js";
    const store = getStore();

    let rounded, classesFront, classesBack, classesContainer;
    $: classesContainer = `v-card relative select-none`;
    $: rounded = `rounded-t-token ${!$store.revealed && "rounded-b-token"}`;

    $: classesFront = `front ${rounded} bg-surface-900-50-token text-primary-50-900-token`;
    $: classesBack = `back rounded-b-token bg-surface-200-700-token text-primary-900-50-token`;

    let svgClasses =
        "w-6 h-6 text-primary-50-900-token absolute top-0 right-0 p-2 box-content cursor-grab";
</script>

<div class={classesContainer}>
    <svg
        class={svgClasses}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
            d="M5 7h14M5 12h14M5 17h14"
        />
    </svg>

    <div class={classesFront}>
        {@html $store.instruction.front}
    </div>
    {#if $store.revealed}
        <div class={classesBack}>
            {@html $store.instruction.back}
        </div>
    {/if}
</div>

<style lang="postcss">
    .v-card {
        @apply rounded-token border-token;
    }
    .v-card svg {
        /* align to the upper right side of the card */
    }
    .front {
        @apply w-80 min-h-[10em] py-6 px-8 min-w-[20em] w-auto;
    }
    .back {
        @apply w-80 min-h-[10em] py-6 px-8 min-w-[20em] w-auto;
    }
</style>

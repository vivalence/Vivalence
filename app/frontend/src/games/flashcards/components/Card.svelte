<script>
    // import { onMount } from "svelte";
    import { pan, swipe } from "svelte-gestures";
    import { flashcardsStore } from "../store.js";
    let rounded, classesFront, classesBack, classesContainer;
    $: rounded = `rounded-t-xl ${!$flashcardsStore.revealed && "rounded-b-xl"}`;
    $: classesFront = `bg-theme-ui-2 w-80 min-h-[12em] py-6 px-8 shadow-sm text-theme-text-1 ${rounded}`;
    $: classesBack = `bg-theme-ui-5 w-80 min-h-[12em] py-6 px-8 shadow-sm text-theme-text-4 rounded-b-xl`;
    $: classesContainer = `select-none font-inherit text-theme-text-1 font-sans-text`;
</script>

<div class={classesContainer}>
    <div class={classesFront}>
        {@html $flashcardsStore.current.front}
    </div>
    {#if $flashcardsStore.revealed}
        <div class={classesBack}>
            {@html $flashcardsStore.current.back}
        </div>
    {/if}
</div>

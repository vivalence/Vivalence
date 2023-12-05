<!--     // import { flashcardsStore } from "../store.js"; -->
<script>
    import Tag from "$kit/tag/Tag.svelte";
    import Text from "$kit/text/Text.svelte"; // your existing Text component

    export let variant = "success"; // success info  warning danger //dark light
    export let subject;
    export let correction = "";
    export let tags = null;

    let dominantColor = `system-${variant}-2`;
    let textColor = `theme-text-4`;

    $: {
        switch (variant) {
            case "success":
                dominantColor = "system-success-2";
                textColor = "theme-text-4";
                break;
            case "warning":
                dominantColor = "system-warning-2";
                textColor = dominantColor;
                break;
        }
    }
</script>

<div class={`py-5 px-6 rounded-xl border-4 bg-theme-ui-5 w-[270px] border-${dominantColor}`}>
    <Text color={textColor} size="lg" classes="mb-1">
        {subject}
    </Text>
    {#if correction}
        <Text color="theme-text-4" weight="thin" size="xs" as="span" italic classes="mb-0 pb-0"
            >correction</Text
        >
        <Text color="theme-text-4" classes="mb-2" size="lg">
            {correction}
        </Text>
    {/if}
    {#if tags}
        <div class="mt-2">
            {#each tags as tag}
                <Tag variant={tag.variant} size="sm" as="span">
                    {tag.value}
                </Tag>
            {/each}
        </div>
    {/if}
</div>

<script>
    import Text from "../text/Text.svelte";
    import FlexContainer from "../flex/Container.svelte";
    import Item from "../flex/Item.svelte";

    export let bgColor = "bg-theme-ui-1";
    export let borderColor = "border-theme-border-1";
    export let border = "border";

    export let classes = "";
    export let title = "";

    let showHr;
    let showHeader;
    $: showHeader = !!title;
</script>

<div class={`container  ${classes} ${bgColor} ${borderColor} ${border} rounded-xl px-6 pt-2 pb-6 `}>
    <FlexContainer direction="col">
        {#if showHeader}
            <Item shrink="shrink-1" classes="px-3 py-4 mb-2">
                <Text elementType="h2" variant="heading" weight='medium' size="xl" color="theme-text-1">
                    {title}
                </Text>
            </Item>
        {/if}
        {#if showHr}
            <Item shrink="shrink-1" classes="w-full mb-3">
                <hr class="border-theme-border-1" />
            </Item>
        {/if}

        <Item classes="w-full">
            <slot />
        </Item>
    </FlexContainer>
</div>

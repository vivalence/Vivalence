<script>
    import Text from "../text/Text.svelte";
    import FlexContainer from "../flex/Container.svelte";
    import Item from "../flex/Item.svelte";

    export let classes = "";
    export let title = "";

    let showHeader;
    $: showHeader = !!title;
</script>

<div class={`container bg-theme-ui-1 px-6 pt-2 pb-6 ${classes}`}>
    <FlexContainer direction="col">
        {#if showHeader}
            <Item shrink="shrink-1" classes="px-3 py-2">
                <Text variant="heading" size="lg" color="theme-text-1">
                    {title}
                </Text>
            </Item>
            <Item shrink="shrink-1" classes="w-full mb-3">
                <hr class="border-theme-border-1" />
            </Item>
        {/if}

        <Item classes="">
            <slot />
        </Item>
    </FlexContainer>
</div>

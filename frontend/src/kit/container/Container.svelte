<script>
    import Text from "../text/Text.svelte";
    import Container from "../flex/Container.svelte";
    import Item from "../flex/Item.svelte";
    export let title = "";
</script>

<div class="container bg-theme-ui-1">
    <Container direction='col'>
        <Item shrink="shrink-1">
            <Text size="lg">
                {title}
            </Text>
        </Item>

        <Item>
            <slot />
        </Item>
    </Container>
</div>

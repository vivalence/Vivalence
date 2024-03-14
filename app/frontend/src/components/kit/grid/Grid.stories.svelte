<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import GridContainer from "./Container.svelte";
    import GridItem from "./Item.svelte";
</script>

<Meta
    title="Kit/Layout/Grid"
    component={GridContainer}
    parameters={{ backgrounds: { default: "light" } }}
/>

<Template let:args>
    <GridContainer {...args} classes='bg-palette-gray'>
        <GridItem classes='bg-palette-honeyOrange'>Item 1</GridItem>
        <GridItem classes='bg-palette-bananaYellow'>Item 2</GridItem>
        <GridItem classes='bg-palette-moroccanBlue'>Item 3</GridItem>
        <GridItem classes='bg-palette-arcticAqua'>Item 4</GridItem>
        <GridItem classes='bg-palette-cathodeGreen'>Item 5</GridItem>
        <GridItem classes='bg-palette-cherryRed'>Item 6</GridItem>
        <GridItem classes='bg-palette-black'>Item 7</GridItem>
    </GridContainer>
</Template>

<Story name="Grid" args={{ columns: "3", rows:'3', gap: '1' }}></Story>

<!-- <Story name="SpanningGridItem" args={{ columns: '3', gap: '2' }}> -->
<!--     <GridItem colSpan="2">Item 1 spans 2 columns</GridItem> -->
<!--     <GridItem>Item 2</GridItem> -->
<!--     <GridItem rowSpan="2">Item 3 spans 2 rows</GridItem> -->
<!--     <GridItem>Item 4</GridItem> -->
<!--     <GridItem>Item 5</GridItem> -->
<!-- </Story> -->

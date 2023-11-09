<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import FlexContainer from "./Container.svelte";
    import FlexItem from "./Item.svelte";
</script>

<Meta
    title="Kit/Layout/Flex"
    component={FlexContainer}
    parameters={{ backgrounds: { default: "light" } }}
/>

<Template let:args>
    <FlexContainer {...args} classes='bg-palette-gray'>
        <FlexItem classes='bg-palette-honeyOrange'>Item 1</FlexItem>
        <FlexItem classes='bg-palette-bananaYellow'>Item 2</FlexItem>
        <FlexItem grow="grow-[3]" classes='bg-palette-moroccanBlue'>Item 3</FlexItem>
        <FlexItem grow="grow-[2]" classes='bg-palette-arcticAqua'>Item 4</FlexItem>
        <FlexItem grow="grow-[4]" classes='bg-palette-cathodeGreen'>Item 5</FlexItem>
        <FlexItem classes='bg-palette-cherryRed'>Item 6</FlexItem>
        <FlexItem classes='bg-palette-black'>Item 7</FlexItem>
    </FlexContainer>
</Template>

<Story name="Flex" args={{}}></Story>

<!-- <Story name="SpanningFlexItem" args={{ columns: '3', gap: '2' }}> -->
<!--     <FlexItem colSpan="2">Item 1 spans 2 columns</FlexItem> -->
<!--     <FlexItem>Item 2</FlexItem> -->
<!--     <FlexItem rowSpan="2">Item 3 spans 2 rows</FlexItem> -->
<!--     <FlexItem>Item 4</FlexItem> -->
<!--     <FlexItem>Item 5</FlexItem> -->
<!-- </Story> -->

<!-- <script> -->
<!--     import { Meta, Story } from "@storybook/addon-svelte-csf"; -->
<!--     import FlexContainer from "./Container.svelte"; -->
<!--     import FlexItem from "./Item.svelte"; -->
<!-- </script> -->

<!-- <Meta title="Layout/Flex" /> -->

<!-- <\!-- Story: Basic Row Layout -\-> -->
<!-- <Story -->
<!--     name="Basic Row Layout" -->
<!--     args={{ direction: "row", justifyContent: "start", alignItems: "start", gap: "4" }} -->
<!-- > -->
<!--     <Template let:args> -->
<!--         <FlexContainer {...args}> -->
<!--             <FlexItem>Item 1</FlexItem> -->
<!--             <FlexItem>Item 2</FlexItem> -->
<!--             <FlexItem>Item 3</FlexItem> -->
<!--         </FlexContainer> -->
<!--     </Template> -->
<!-- </Story> -->

<!-- <\!-- Story: Column Layout -\-> -->
<!-- <Story -->
<!--     name="Column Layout" -->
<!--     args={{ direction: "col", justifyContent: "start", alignItems: "start", gap: "4" }} -->
<!-- > -->
<!--     <Template let:args> -->
<!--         <FlexContainer {...args}> -->
<!--             <FlexItem>Item 1</FlexItem> -->
<!--             <FlexItem>Item 2</FlexItem> -->
<!--             <FlexItem>Item 3</FlexItem> -->
<!--         </FlexContainer> -->
<!--     </Template> -->
<!-- </Story> -->

<!-- <\!-- More stories for Wrap Layout, Justify Content, Align Items, etc. -\-> -->

<!-- <\!-- FlexItem stories would be similar, demonstrating different properties like grow, shrink, basis, order, and alignSelf. -\-> -->

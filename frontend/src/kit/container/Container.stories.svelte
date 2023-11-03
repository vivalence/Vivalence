<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import Container from "./Container.svelte";
</script>

<Meta
    title="Container"
    component={Container}
    parameters={{ backgrounds: { default: "light" } }}
    argTypes={{
        content: {
            control: "text"
        },
        titel: {
            control: "text"
        }
    }}
/>

<Template let:args>
    <Container {...args} classes="bg-palette-gray">Second text</Container>
</Template>

<Story args={{ title: "first text" }} name="Container"></Story>

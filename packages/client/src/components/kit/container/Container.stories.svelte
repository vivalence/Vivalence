<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import Container from "./Container.svelte";
</script>

<!-- parameters={{ backgrounds: { default: "light" } }} -->
<Meta
    title="Kit/Container"
    component={Container}
    argTypes={{
        content: { control: "text" },
        titel: { control: "text" }
    }}
/>

<Template let:args>
    <Container {...args} classes="bg-palette-gray">{args.content}</Container>
</Template>

<Story args={{ title: "first text" }} name="Container"></Story>

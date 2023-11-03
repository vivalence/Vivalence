<script>
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
    import Button from "./Button.svelte";
</script>

<Meta
    title="Button"
    component={Button}
    argTypes={{
        label: {
            control: "text"
        },
        hierarchy: {
            control: "inline-radio",
            options: ["accent", "primary", "secondary", "destructive"]
        },
        size: {
            control: "inline-radio",
            options: ["sm", "md", "lg", "xl"]
        },
        outlined: { control: "boolean" }
    }}
/>

<Template let:args>
    <Button {...args} />
</Template>

<Story
    name="Button"
    args={{ label: "Click me", hierarchy: "primary", size: "md", outlined: false }}
/>


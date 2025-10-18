<script>
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
    import Text from "./Text.svelte";
</script>

<Meta
    title="Kit/Text"
    component={Text}
    argTypes={{
        content: { control: "text" },
        variant: {
            control: "inline-radio",
            options: ["heading", "text", "code"]
        },
        serif: { control: "boolean" },
        weight: {
            control: "inline-radio",
            options: ["regular", "light", "medium", "heavy"]
        },
        italic: { control: "boolean" },
        size: {
            control: "inline-radio",
            options: ["xs", "sm", "md", "lg", "xl"]
        },
        color: {
            control: "inline-radio",
            options: [
                "link",
                "text-1",
                "text-2",
                "placeholder",
                "contrast",
                "hint",
                "disabled",
                "error",
                "inverse"
            ]
        },
        elementType: {
            control: "inline-radio",
            options: ["h1", "h2", "h3", "p", "span"]
        },
        classes: { control: "text" }
    }}
/>

<Template let:args>
    <Text {...args}>
        {args.content}
    </Text>
</Template>

<Story
    name="Text"
    parameters={{ backgrounds: { default: "light" } }}
    args={{ content: "Sample Text", variant: "text", serif: true, weight: "regular" }}
/>

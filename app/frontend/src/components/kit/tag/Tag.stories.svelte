<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import { action } from "@storybook/addon-actions";

    import Tag from "./Tag.svelte";
</script>

<Meta
    title="Kit/Tag"
    component={Tag}
    argTypes={{
        content: { control: "text" },
        variant: {
            control: "inline-radio",
            options: ["info", "success", "warning", "danger"]
        },
        size: {
            control: "inline-radio",
            options: ["xs", "sm", "md", "lg", "xl"]
        }
    }}
/>

<Template let:args>
    <Tag {...args}>{args.content}</Tag>
</Template>

<Story
    name="Default"
    parameters={{ backgrounds: { default: "light" } }}
    args={{ content: "Subject", variant: "info", size: "md" }}
></Story>

<!-- <Story name="CustomType" args={{ content: "Gender", type: "bg-red-500" }}> -->
<!--     <Tag {...args}>{args.content}</Tag> -->
<!-- </Story> -->

<!-- <Story name="Tag" let:args parameters={{ backgrounds: { default: "light" } }} > -->
<!--             <Tag {...args} /> -->
<!-- </Story> -->
<!-- <\!-- <Story name="Tag" parameters={{ backgrounds: { default: "light" } }} /> -\-> -->

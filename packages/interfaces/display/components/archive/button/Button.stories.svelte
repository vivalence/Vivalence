<script>
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
    import Reset from "carbon-icons-svelte/lib/Reset.svelte";

    import Button from "./Button.svelte";
    import Icon from "../icon/Icon.svelte";
</script>

<Meta
    title="Kit/Button"
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
        outlined: { control: "boolean" },
        iconClass: {
            control: "text"
        }
    }}
/>

<Template let:args>
    <Button {...args} IconComponent={args.icon && Reset}>
        {args.label}
    </Button>
</Template>

<Story
    name="Button"
    args={{ label: "Click me", hierarchy: "primary", size: "md", outlined: false }}
/>

<Story
    name="Icon Button"
    args={{ iconClass: "rotate-90", icon: true, hierarchy: "primary", size: "md" }}
/>

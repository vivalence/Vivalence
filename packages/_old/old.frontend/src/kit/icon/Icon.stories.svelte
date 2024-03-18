<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import { action } from "@storybook/addon-actions";

    import Container from "../container/Container.svelte";
    import Icon from "./Icon.svelte";
    import IconContainer from "./IconContainer.svelte";
</script>

<Meta
    title="Kit/Icon"
    component={Icon}
    argTypes={{
        icon: {
            control: "text"
        },
        hierarchy: {
            control: "inline-radio",
            options: ["accent", "primary", "secondary", "destructive"]
        },
        outlined: { control: "boolean" },
        state: {
            control: "inline-radio",
            options: ["disabled", "default"]
        },
        size: {
            control: "inline-radio",
            options: ["sm", "md", "lg", "xl"]
        },
        classes: { control: "text" }
    }}
/>
<Meta
    title="Kit/Icon"
    component={IconContainer}
    argTypes={{
        hierarchy: {
            control: "inline-radio",
            options: ["accent", "primary", "secondary", "destructive"]
        },
        bordered: { control: "boolean" },
        size: {
            control: "inline-radio",
            options: ["sm", "md", "lg", "xl"]
        },
        classes: { control: "text" }
    }}
/>

<Template let:args>
    <Container>
        <Icon {...args} />
    </Container>
</Template>

<Story name="Containered Icon" args={{ icon: "data/Show-data--cards.svg" }} let:args>
    <Container>
        <IconContainer bordered>
            <Icon {...args} />
        </IconContainer>
    </Container>
</Story>
<Story name="Icon" args={{ icon: "data/Show-data--cards.svg" }} />

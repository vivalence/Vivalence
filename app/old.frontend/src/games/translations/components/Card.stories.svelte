<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import Card from "./Card.svelte";
</script>

<!-- subject: required text -->
<!-- correction: optional text -->
<!-- variant: info success warning danger -->
<!-- tags: array of components -->
<Meta
    title="Games/Translations/Card"
    component={Card}
    argTypes={{
        subject: {
            control: "text"
        },
        correction: {
            control: "text"
        },
        variant: {
            control: "select",
            options: ["info", "success", "warning", "danger"]
        },
        tags: {
            control: { type: "array" }
        }
    }}
/>

<Template let:args>
    <Card {...args} />
</Template>

<Story
    parameters={{ backgrounds: { default: "dark" } }}
    args={{
        subject: "on la",
        variant: "success",
        tags: [
            { variant: "dark", value: "Article" },
        ]
    }}
    name="Card/Success"
></Story>

<Story
    parameters={{ backgrounds: { default: "dark" } }}
    args={{
        subject: "on la",
        correction: "en la",
        variant: "warning",
        tags: [
            { variant: "dark", value: "Article" },
            { variant: "dark", value: "Preposition" },
            { variant: "warning", value: "Spelling" }
        ]
    }}
    name="Card/Warning"
></Story>

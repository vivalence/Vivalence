<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import Card from "./Card.svelte";
</script>

<!-- parameters={{ backgrounds: { default: "light" } }} -->
<Meta
    title="Games/Flashcards/Card"
    component={Card}
    argTypes={{
        revealed: { control: "boolean" },
        front: { control: "text" },
        back: { control: "text" }
    }}
/>

<Template let:args>
    <Card {...args} />
</Template>

<Story
    args={{
        revealed: true,
        front: `<p class=\"text-3xl font-sans-heading font-regular mb-2\">challenge, provocation</p>\n <p class=\"text-xl\">they mocked him as a personal challenge</p>`,
        back: `<p class=\"text-3xl  font-sans-heading font-regular mb-2\">desafío</p>\n <p class=\"text-xl\">se burlaban de él como un desafío personal</p>`
    }}
    name="Card"
></Story>

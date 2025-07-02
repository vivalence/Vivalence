<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import { action } from "@storybook/addon-actions";

    import GameCard from "./GameCard.svelte";
</script>

<Meta title="Kit/Card/GameCard" component={GameCard} />

<Story
    name="GameCard"
    args={{
        icon: "FLASHCARDS",
        title: "Your Game",
        description: "So much text detail about this small little card.",
        buttonText: "Play now"
    }}
    let:args
>
    <GameCard {...args} on:primaryButtonClick />
</Story>

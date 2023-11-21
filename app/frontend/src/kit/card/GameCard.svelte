<script>
    import { createEventDispatcher } from "svelte";
    import HR from "../hr/HR.svelte";
    import Icon from "../icon/Icon.svelte";
    import IconContainer from "../icon/IconContainer.svelte";
    import Text from "../text/Text.svelte";
    import Button from "../button/Button.svelte";
    import Container from "./Container.svelte";
    import FlexContainer from "../flex/Container.svelte";
    import FlexItem from "../flex/Item.svelte";

    export let icon;
    export let title = "";
    export let description = "";
    export let buttonText = "";

    switch (icon) {
        case "FLASHCARDS":
            icon = "data/Show-data--cards.svg";
            break;
        default:
            icon = null;
    }

    const dispatch = createEventDispatcher();

    const handleClick = () => dispatch("primaryButtonClick");
</script>

<Container>
    <FlexContainer direction="col" classes="bg-white py-6 rounded-lg">
        {#if icon}
            <FlexItem shrink="1" classes="mx-6 mb-4">
                <IconContainer bordered size="md">
                    <Icon {icon} size="md" />
                </IconContainer>
            </FlexItem>
        {/if}
        {#if title}
            <FlexItem classes="mx-6">
                <Text as="h5" weight="medium" size="xl">{title}</Text>
            </FlexItem>
        {/if}
        {#if description}
            <FlexItem classes="mx-6 mb-4">
                <Text as="p" weight="regular" size="mg">{description}</Text>
            </FlexItem>
        {/if}

        <FlexItem classes="mb-3 mt-4 w-full">
            <HR />
        </FlexItem>

        {#if handleClick}
            <FlexItem classes="mx-6 ">
                <Button hierarchy="secondary" on:click={handleClick}>{buttonText}</Button>
            </FlexItem>
        {/if}
    </FlexContainer>
</Container>

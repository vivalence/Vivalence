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

    import IconCards from "../../../static/icons/data/Show-data--cards.svg";

    export let showHr = false;
    export let icon;
    export let title = "";
    export let description = "";
    export let buttonText = "";

    switch (icon) {
        case "FLASHCARDS":
            icon = IconCards;
            console.log("icon", icon, IconCards);
            break;
        default:
            icon = null;
    }

    const dispatch = createEventDispatcher();

    const handleClick = () => dispatch("primaryButtonClick");
</script>

<Container borderColor="border-theme-border-2" classes="bg-theme-ui-1 hover:bg-theme-ui-2">
    <FlexContainer direction="col" classes="py-6">
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

        {#if showHr}
        <FlexItem classes="mb-3 mt-4 w-full">
            <HR />
        </FlexItem>
        {/if}

        {#if handleClick}
            <FlexItem classes="mx-6 mt-3">
                <Button hierarchy="accent" on:click={handleClick}>{buttonText}</Button>
            </FlexItem>
        {/if}
    </FlexContainer>
</Container>

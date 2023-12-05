<script>
    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";
    import Reset from "carbon-icons-svelte/lib/Reset.svelte";

    import Text from "$kit/text/Text.svelte";
    import Container from "$kit/container/Container.svelte";
    import Button from "$kit/button/Button.svelte";
    import Input from "$kit/input/Input.svelte";

    import { gameStore } from "../store.js";

    const onValue = (value) => gameStore.setInput(value);
    async function commitTranslation() {
        gameStore.reveal(true);
        await gameStore.submitReview();
        // await gameStore.sendSentence();
    }
    const onClick = () => commitTranslation();
</script>

<Container classes="align-center text-center">
    <div class="mx-9 mt-9 mb-4 text-center">
        <Text variant="heading" size="2xl" as="h1" weight="medium">
            {$gameStore.sentence.spoken}
        </Text>
    </div>
    <FlexContainer classes="mx-9 mt-9 mb-9">
        <FlexItem grow>
            <Input value={$gameStore.input} {onValue} containerClasses={`min-w-[24em]`} />
        </FlexItem>
        <FlexItem classes="ml-3">
            <Button
                on:click={onClick}
                IconComponent={Reset}
                icon
                hierarchy="secondary"
                iconClass="rotate-90"
                size="md"
            />
        </FlexItem>
    </FlexContainer>
</Container>

<script>
    import Loader from "$kit/loader/Loader.svelte";
    import Container from "$kit/container/Container.svelte";
    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";
    import Text from "$kit/text/Text.svelte";
    import Button from "$kit/button/Button.svelte";

    import Card from "./Card.svelte";
    import { gameStore } from "../store.js";

    let hasFeedback, userTranslation, spokenSentence, correctedSentence, feedback;
    $: {
        hasFeedback = !!$gameStore.feedback;
        userTranslation = $gameStore.input;
        spokenSentence = $gameStore.sentence.spoken;
        correctedSentence =
            ($gameStore.feedback && $gameStore.feedback.correction) || $gameStore.sentence.learning;
    }
    const onGetFeedback = () => gameStore.getFeedback();

    const classificationMap = {
        correct: "success",
        info: "info",
        mistake: "warning",
        failure: "danger"
    };
</script>

<Container classes=" z-20 min-w-[60vw] max-w-[80vw]">
    <FlexContainer direction="col" classes=" mx-12 my-8">
        <FlexItem classes="mb-6">
            <Text as="span" weight="light" size="xs" allcaps>original</Text>
            <Text classes="mt-1" size="xl">{spokenSentence}</Text>
        </FlexItem>
        <FlexItem classes="mb-6">
            <Text as="span" weight="light" size="xs" allcaps>Your translation</Text>
            <Text classes="mt-1" size="xl">{userTranslation}</Text>
        </FlexItem>
        <FlexItem classes="mb-6">
            <Text as="span" weight="light" size="xs" allcaps>Correction</Text>
            <Text classes="mt-1" size="xl">{correctedSentence}</Text>
        </FlexItem>

        {#if !$gameStore.feedback}
            <FlexItem classes="w-full">
                {#if $gameStore.loadingFeedback}
                    <FlexContainer justify="center" classes="w-full">
                        <FlexItem>
                            <Loader classes="mx-auto" />
                        </FlexItem>
                    </FlexContainer>
                {:else}
                    <Button on:click={onGetFeedback} hierarchy="secondary" size="md">
                        Get Feedback
                    </Button>
                {/if}
            </FlexItem>
        {:else}
            <FlexItem classes="mb-6">
                <Text as="span" weight="light" size="xs" allcaps>Corrections</Text>
                <FlexContainer wrap="wrap" classes="w-full mt-1">
                    {#each $gameStore.feedback.parts as part}
                        <FlexItem classes="mr-4 mb-3">
                            <Card
                                variant={classificationMap[part.classification]}
                                subject={part.translation || part.part}
                                correction={part.correction}
                            />
                        </FlexItem>
                    {/each}
                </FlexContainer>
            </FlexItem>
            {#if $gameStore.feedback.feedback}
                <FlexItem>
                    <Text as="span" weight="light" size="xs" allcaps>Feedback</Text>
                    <Text size="md" classes="max-w-2xl mt-1 pr-20"
                        >{$gameStore.feedback.feedback}</Text
                    >
                </FlexItem>
            {/if}
        {/if}
    </FlexContainer>
</Container>

<script>
    import Loader from "$kit/loader/Loader.svelte";
    import Container from "$kit/container/Container.svelte";
    import FlexContainer from "$kit/flex/Container.svelte";
    import FlexItem from "$kit/flex/Item.svelte";
    import Text from "$kit/text/Text.svelte";

    import Card from "./Card.svelte";
    import { gameStore } from "../store.js";

    let loading, userTranslation, sentence, review;
    $: {
        loading = !$gameStore.review;
        userTranslation = $gameStore.input;
        sentence = $gameStore.sentence || $gameStore.review.sentence;
        review = $gameStore.review;
    }

    const classificationMap = {
        correct: "success",
        info: "info",
        mistake: "warning",
        failure: "danger"
    };
</script>

<Container classes=" z-20 min-w-[60vw] max-w-[80vw]">
    <FlexContainer direction="col" classes="w-full  mx-12 my-8">
        <FlexItem classes="mb-6">
            <Text as="span" weight="light" size="xs" allcaps>original</Text>
            <Text classes="mt-1" size="xl">{sentence.spoken}</Text>
        </FlexItem>
        <FlexItem classes="mb-6">
            <Text as="span" weight="light" size="xs" allcaps>Your translation</Text>
            <Text classes="mt-1" size="xl">{userTranslation}</Text>
        </FlexItem>

        {#if loading}
            <FlexItem classes="w-full">
                <FlexContainer justify="center" classes="w-full">
                    <FlexItem>
                        <Loader classes="mx-auto" />
                    </FlexItem>
                </FlexContainer>
            </FlexItem>
        {:else}
            <FlexItem classes="mb-6">
                <Text as="span" weight="light" size="xs" allcaps>Corrected</Text>
                <Text classes="mt-1" size="xl">{review.correction}</Text>
            </FlexItem>
            <FlexItem classes="mb-6">
                <Text as="span" weight="light" size="xs" allcaps>Corrections</Text>
                <FlexContainer wrap="wrap" classes="w-full mt-1">
                    {#each review.parts as part}
                        <FlexItem classes="mr-4 mb-3">
                            <Card
                                variant={classificationMap[part.classification]}
                                subject={part.part}
                                correction={part.correction}
                            />
                        </FlexItem>
                    {/each}
                </FlexContainer>
            </FlexItem>
            {#if review.feedback}
                <FlexItem>
                    <Text as="span" weight="light" size="xs" allcaps>Feedback</Text>
                    <Text size="md" classes="max-w-2xl mt-1 pr-20">{review.feedback}</Text>
                </FlexItem>
            {/if}
        {/if}
    </FlexContainer>
</Container>

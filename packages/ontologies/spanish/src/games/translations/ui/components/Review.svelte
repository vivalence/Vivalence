<script>
    // import Card from "./Card.svelte";
    import { onMount } from "svelte";
    import Loader from "./Loader.svelte";

    import { getStore } from "../store.js";
    const store = getStore();

    const getFeedback = async () => {
        store.setLoading(true);
        await store.feedback();
        store.setLoading(false);
    };
</script>

<div class="review">
    <label class="label">
        <span>Translation</span>
        <p class="">
            {$store.instruction.sentence.spoken}
        </p>
    </label>

    <label class="label">
        <span>Provided:</span>
        <p class="">
            {$store.input}
        </p>
    </label>
    <label class="label">
        <span>Expected:</span>
        <p class="">
            {$store.feedback ? $store.feedback.correction : $store.instruction.sentence.learning}
        </p>
    </label>

    {#if !$store.feedback}
        <div class="w-full mt-8">
            {#if $store.loading}
                <Loader />
            {:else}
                <div />
                <!-- <button class="btn variant-ghost" on:click={getFeedback}>Detailed Feedback</button> -->
            {/if}
        </div>
    {:else}
        <label class="label">
            <span>Feedback:</span>
            <p class="">
                {$store.feedback.summary}
            </p>
        </label>

        <label class="label">
            <span>classification:</span>
            <p class="">
                {$store.feedback.classification}
            </p>
        </label>

        <label class="label">
            <span>Score:</span>
            <p class="">
                {$store.feedback.score}
            </p>
        </label>
    {/if}
</div>

<!--     <FlexContainer direction="col" classes=" mx-12 my-8"> -->
<!--         <FlexItem classes="mb-6"> -->
<!--             <Text as="span" weight="light" size="xs" allcaps>original</Text> -->
<!--             <Text classes="mt-1" size="xl">{spokenSentence}</Text> -->
<!--         </FlexItem> -->
<!--         <FlexItem classes="mb-6"> -->
<!--             <Text as="span" weight="light" size="xs" allcaps>Your translation</Text> -->
<!--             <Text classes="mt-1" size="xl">{userTranslation}</Text> -->
<!--         </FlexItem> -->
<!--         <FlexItem classes="mb-6"> -->
<!--             <Text as="span" weight="light" size="xs" allcaps>Correction</Text> -->
<!--             <Text classes="mt-1" size="xl">{correctedSentence}</Text> -->
<!--         </FlexItem> -->

<!--         {#if !$gameStore.feedback} -->
<!--             <FlexItem classes="w-full"> -->
<!--                 {#if $gameStore.loadingFeedback} -->
<!--                     <FlexContainer justify="center" classes="w-full"> -->
<!--                         <FlexItem> -->
<!--                             <Loader classes="mx-auto" /> -->
<!--                         </FlexItem> -->
<!--                     </FlexContainer> -->
<!--                 {:else} -->
<!--                     <Button on:click={onGetFeedback} hierarchy="secondary" size="md"> -->
<!--                         Get Feedback -->
<!--                     </Button> -->
<!--                 {/if} -->
<!--             </FlexItem> -->
<!--         {:else} -->
<!--             <FlexItem classes="mb-6"> -->
<!--                 <Text as="span" weight="light" size="xs" allcaps>Corrections</Text> -->
<!--                 <FlexContainer wrap="wrap" classes="w-full mt-1"> -->
<!--                     {#each $gameStore.feedback.parts as part} -->
<!--                         <FlexItem classes="mr-4 mb-3"> -->
<!--                             <Card -->
<!--                                 variant={classificationMap[part.classification]} -->
<!--                                 subject={part.translation || part.part} -->
<!--                                 correction={part.correction} -->
<!--                             /> -->
<!--                         </FlexItem> -->
<!--                     {/each} -->
<!--                 </FlexContainer> -->
<!--             </FlexItem> -->
<!--             {#if $gameStore.feedback.summary} -->
<!--                 <FlexItem> -->
<!--                     <Text as="span" weight="light" size="xs" allcaps>Summary</Text> -->
<!--                     <Text size="md" classes="max-w-2xl mt-1 pr-20" -->
<!--                         >{$gameStore.feedback.summary}</Text -->
<!--                     > -->
<!--                 </FlexItem> -->
<!--             {/if} -->
<!--         {/if} -->
<!--     </FlexContainer> -->

<style lang="postcss">
    .review label {
        @apply block mt-4;
    }
    .review label span {
        text-transform: uppercase;
        font-size: 0.75rem;
        line-height: 1rem;
    }

    .review label p {
        font-size: 1.25rem;
        /* font-weight: 400; */
        /* @apply ;  */
    }
</style>

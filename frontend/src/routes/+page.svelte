<script>
    import { graphql } from "$houdini";
    import Card from "../components/SpacedRepetition/Card.svelte";
    import Button from "../views/Button.svelte";

    let revealed = false;
    export let data;
    const ReviewItemMutation = graphql(`
        mutation ReviewItemMutation($input: reviewItemInput!) {
            reviewItem(input: $input) {
                id
                type
                front
                back
                previousItemDelay
            }
        }
    `);

    $: ({ ReviewItemQuery } = data);
    $: reviewItem = { loading: true, error: false, data: null };
    $: if ($ReviewItemQuery.data) {
        reviewItem.data = $ReviewItemQuery.data.reviewItem;
        reviewItem.loading = false;
    } else if ($ReviewItemQuery.error) {
        reviewItem.error = $ReviewItemQuery.error;
    }

    const doReviewUpdate = (response) => async () => {
      try{
        reviewItem.loading = true;
        revealed = false;

        const update = await ReviewItemMutation.mutate({
            input: { id: reviewItem.data.id, response, type: "WORD" }
        });

        if (update.errors) {
            reviewItem.error = update.errors[0];
        } else {
            reviewItem.data = update.data.reviewItem;
        }
        reviewItem.loading = false;
      } catch (e) {
        reviewItem.error = e;
        console.log("doReviewUpdate ERROR", e);
        throw e;
      }
    };

    const doReveal = () => (revealed = true);

    $: if (reviewItem.data && reviewItem.data.previousItemDelay) {
        setTimeout(() => {
            reviewItem.data.previousItemDelay = null;
        }, 1000);
    }
</script>


{#if false && reviewItem.data && reviewItem.data.previousItemDelay}
    <div class="fixed top-0 w-full flex items-center justify-center h-8 bg-gray-100">
        <div class="flex flex-col items-center justify-center">
            <h1 class="text-xl italic">
                {#if reviewItem.data.previousItemDelay < 1}
                    {Math.round(reviewItem.data.previousItemDelay * 60)} minutes
                {:else if reviewItem.data.previousItemDelay < 24}
                    {Math.round(reviewItem.data.previousItemDelay)} hours
                {:else if reviewItem.data.previousItemDelay < 30 * 24}
                    {Math.round(reviewItem.data.previousItemDelay / 24)} days
                {:else if reviewItem.data.previousItemDelay < 365 * 24}
                    {Math.round(reviewItem.data.previousItemDelay / (30 * 24))} months
                {:else}
                    {Math.round(reviewItem.data.previousItemDelay / (365 * 24))} years
                {/if}
                <small>
                    ({Math.floor(reviewItem.data.previousItemDelay * 100) / 100})
                </small>
            </h1>
        </div>
    </div>
{/if}

<div class="flex flex-col justify-center h-screen scroll">
    <div class="flex-grow bg-gray-200 pb-32 flex flex-row justify-center pt-16">
        {#if reviewItem.loading}
            <div class="flex-initial w-96">
                <Card front={`<h1 class="text-3xl font-bold">...</h1>`}  revealed={false} />
            </div>
        {:else if reviewItem.error}
            <div class="flex items-center justify-center h-64">
                <h1 class="text-3xl font-bold">Error</h1>
            </div>
        {:else if reviewItem.data}
            <div class="flex-initial w-96">
                <Card front={reviewItem.data.front} back={reviewItem.data.back} {revealed} />
            </div>
        {/if}
    </div>

    <div class="fixed bottom-0 w-full flex items-center justify-center h-40 pb-16 bg-gray-400">
        {#if !revealed}
            <div class="">
                <Button on:click={doReveal}>Reveal</Button>
            </div>
        {:else}
            <div class="">
                <Button on:click={doReviewUpdate("UNKNOWN")}>Unknown</Button>
                <Button on:click={doReviewUpdate("KNOWN")}>Knew</Button>
                <Button on:click={doReviewUpdate("GRADUATE")}>Graduate</Button>
            </div>
        {/if}
    </div>
</div>

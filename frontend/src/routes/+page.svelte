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
        revealed = false;
        reviewItem.loading = true;

        const update = await ReviewItemMutation.mutate({
            input: { id: reviewItem.data.id, response, type: "WORD" }
        });

        if (update.errors) {
            reviewItem.error = update.errors[0];
        } else {
            reviewItem.data = update.data.reviewItem;
        }
        reviewItem.loading = false;
    };
    const doReveal = () => (revealed = true);

    // $: console.log(reviewItem, data);
</script>

<div class="flex flex-col justify-center h-screen scroll">
    <div class="flex-grow bg-gray-200 pb-32 flex flex-row justify-center pt-24">
        {#if reviewItem.loading}
            <div class="flex items-center justify-center h-64">
                <h1 class="text-3xl font-bold">Loading...</h1>
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

    <div class="fixed bottom-0 w-full flex items-center justify-center h-28 bg-gray-400">
        {#if !revealed}
            <div class="">
                <Button on:click={doReveal}>Reveal</Button>
            </div>
        {:else}
            <div class="">
                <Button on:click={doReviewUpdate("UNKNOWN")}>Unknow</Button>
                <Button on:click={doReviewUpdate("KNOWN")}>Knew</Button>
                <Button on:click={doReviewUpdate("GRADUATE")}>Graduate</Button>
            </div>
        {/if}
    </div>
</div>

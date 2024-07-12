<script>
    import EvalCard from "./Card.svelte";
    import { onMount } from "svelte";
    import Loader from "./Loader.svelte";
    import { getStore } from "../store.js";
    const store = getStore();
</script>

<div class="review">
    <label class="label">
        <span>English</span>
        <p>{$store.instruction.sentence.spoken}</p>
    </label>
    <label class="label">
        <span>Your Translation:</span>
        <p>{$store.input}</p>
    </label>
    {#if $store.evaluation}
        <label class="label"> <span>Evaluation:</span> </label>

        <div class="flex flex-wrap gap-4">
            {#each $store.evaluation as evaluation}
                <div class="basis-50 max-w-md">
                    <EvalCard {...evaluation} />
                </div>
            {/each}
        </div>
    {:else if $store.loading}
        <label class="label">
            <span>Expected:</span>
            <p>{$store.instruction.sentence.learning}</p>
        </label>
        <Loader />
    {:else if $store.error}
        <p>{JSON.stringify($store.error)}</p>
    {/if}
</div>

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
        @apply text-3xl;
    }
</style>

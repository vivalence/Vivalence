<script>
    import { page } from "$app/stores";
    import { createEventDispatcher } from "svelte";
    import { getContext, onDestroy, onMount } from "svelte";

    import Panable from "$components/panable/Panable.svelte";
    import Card from "./components/Card.svelte";
    import Footer from "./components/Footer.svelte";
    import store from "./store.js";

    const dispatch = createEventDispatcher();
    const pageFooterContext = getContext("page-footer");
    onMount(() => {
        pageFooterContext.set(Footer);
        store.update((s) => ({ ...s, onFinish: (p) => dispatch("finish", p) }));
    });
    onDestroy(() => pageFooterContext.set(null));

    export let payload;
    export let instructions;
    $: if (payload && instructions) {
        store.update((s) => ({ ...s, revealed: false, loading: false, payload, instructions }));
    }

    const onReview = (status) => () => store.review(status);
</script>

<Panable
    on:left={onReview("UNKNOWN")}
    on:right={onReview("KNOWN")}
    on:up={onReview("GRADUATE")}
    on:tap={store.reveal}
>
    <div class="flex items-center justify-center pb-24 h-full v-game">
        <div class="basis-auto">
            {#if !$store.loading}
                <Card />
            {/if}
        </div>
    </div>
</Panable>

<!--     {#if $flashcardsStore.current} -->
<!--         <FlexContainer -->
<!--             items="center" -->
<!--             justify="center" -->
<!--             classes=" h-full h-max w-full lg:mt-32 md:mt-20 mt-12" -->
<!--         > -->
<!--             <FlexItem> -->
<!--                 <Card /> -->
<!--             </FlexItem> -->
<!--         </FlexContainer> -->
<!--     {/if} -->
<!-- <Controls /> -->

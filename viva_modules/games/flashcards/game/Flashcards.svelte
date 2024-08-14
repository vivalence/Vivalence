<script>
    import { getContext, onDestroy, onMount } from "svelte";

    import Panable from "./components/Panable.svelte";
    import Card from "./components/Card.svelte";

    import { createStore } from "./store.js";

    export let matrix;
    export let locals;
    export let scope;
    export let instruction;

    const store = createStore({ locals });

    $: if (scope && instruction) {
        store.update((s) => ({ ...s, revealed: false, loading: false, scope, instruction }));
    }

    const onReview = (status) => () => store.review(status);

    const onReveal = ( ) => {
      if(!$store.revealed){
	store.reveal()
	matrix.clean().use((m) => {
	    m.set(m.signals.navigation['1']({ label: "Unknown", hint: true }), onReview("UNKNOWN"));
	    m.set(m.signals.navigation['2']({ label: "Known", hint: true }), onReview("KNOWN"));
	    m.set(m.signals.navigation['3']({ label: "Graduate", hint: true }), onReview("GRADUATE"));
	});
      }
    }

    onMount(() => {
        matrix.clean().use((m) => {
	    m.set(m.signals.navigation['r']({ label: "Reveal", hint: true }), onReveal);
	    m.set(m.signals.keyboard['Space'], onReveal);
	});

    });

</script>

<div class="h-full v-game-container">
    <Panable
        on:left={onReview("UNKNOWN")}
        on:right={onReview("KNOWN")}
        on:up={onReview("GRADUATE")}
        on:tap={onReveal}
    >
        <div class="flex items-center justify-center h-full v-game-content">
            <div class="basis-auto">
                {#if !$store.loading}
                    <Card />
                {/if}
            </div>
        </div>
    </Panable>
</div>

<style lang="postcss"> </style>

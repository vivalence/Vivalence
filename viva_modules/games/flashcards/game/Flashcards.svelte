<script>
  import { getContext, onDestroy, onMount } from "svelte";

  import Panable from "./components/Panable.svelte";
  // import Card from "./components/Card.svelte";

  import { createStore } from "./store.js";

  // export let trajectory;
  export let locals;
  export let scope;
  export let instruction;

  const store = createStore({ locals });

  $: if (scope && instruction) {
    store.update((s) => ({ ...s, revealed: false, loading: false, scope, instruction }));
  }

  const onReview = (status) => () => store.review(status);

  const onReveal = () => {
    if (!$store.revealed) {
      store.reveal();
      // 	matrix.clean().use((m) => {
      // 	    m.set(m.signals.navigation['1']({ label: "Unknown", hint: true }), onReview("UNKNOWN"));
      // 	    m.set(m.signals.navigation['2']({ label: "Known", hint: true }), onReview("KNOWN"));
      // 	    m.set(m.signals.navigation['3']({ label: "Graduate", hint: true }), onReview("GRADUATE"));
      // 	});
    }
  };

  // onMount(() => {
  //     matrix.clean().use((m) => {
  // 	    m.set(m.signals.navigation['r']({ label: "Reveal", hint: true }), onReveal);
  // 	    m.set(m.signals.keyboard['Space'], onReveal);
  // 	});

  // });
  $: console.log($store);
</script>

<div class="h-full">
  <!-- <div class="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 pt-[20vh]"> -->
  <Panable
    on:left={onReview("UNKNOWN")}
    on:right={onReview("KNOWN")}
    on:up={onReview("GRADUATE")}
    on:tap={onReveal}
  >
    <div class="flex items-center justify-center h-full v-game-content">
      <div class="basis-auto">
        {#if !$store.loading}
          <div class="card bg-base-100 w-96 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Card title!</h2>
              <p>If a dog chews shoes whose shoes does he choose?</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </Panable>
</div>

<div class="fixed bottom-0 left-0 right-0 w-full bg-base-100 px-10 py-16">
  <div
    class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center"
  >
    <!-- <button on:click={store.commitTranslation} class={`btn btn-neutral`} type="button">Review</button> -->
    <!-- <button on:click={store.finishTranslation} class={`btn btn-neutral`} type="button">Next Game</button> -->
  </div>
</div>

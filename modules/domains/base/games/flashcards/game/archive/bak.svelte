<script>
  import { getContext, onDestroy, onMount } from "svelte";

  import Panable from "./components/Panable.svelte";

  import { createStore } from "./store.js";

  export let trajectory;
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
      trajectory.use((t) => {
        t.set(t.signals.keyboard["1"](), onReview("UNKNOWN"));
        t.set(t.signals.keyboard["2"](), onReview("KNOWN"));
        t.set(t.signals.keyboard["3"](), onReview("GRADUATE"));
      });
    }
  };

  onMount(() => {
    trajectory.use((t) => {
      t.set(t.signals.keyboard["Space"](), onReveal);
    });
  });
</script>

<Panable
  on:left={onReview("UNKNOWN")}
  on:right={onReview("KNOWN")}
  on:up={onReview("GRADUATE")}
  on:tap={onReveal}
>
  <div class={`h-screen pb-36 select-none cursor-grab flex flex-col items-center justify-center `}>
    {#if !$store.loading}
      <div class="card bg-base-300 w-96 mb-4">
        <div class="card-body">
          {@html $store.instruction.front}
        </div>
      </div>

      {#if $store.revealed}
        <div class="card bg-base-100 w-96 shadow-xl">
          <div class="card-body">
            {@html $store.instruction.back}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</Panable>

<div class="fixed bottom-0 left-0 right-0 w-full bg-base-100 px-6 py-10">
  <div class="container mx-auto flex items-center justify-center">
    {#if !$store.revealed}
      <button on:click={onReveal} class={`btn btn-primary`} type="button">Reveal</button>
    {:else}
      <button on:click={onReview("UNKNOWN")} class={`btn btn-error btn-outline mr-4`} type="button">
        Unknown
      </button>
      <button on:click={onReview("KNOWN")} class={`btn btn-success btn-outline mr-4`} type="button">
        Known
      </button>
      <button on:click={onReview("GRADUATE")} class={`btn btn-success`} type="button">
        Graduate
      </button>
    {/if}
  </div>
</div>

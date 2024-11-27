<script module>
</script>

<script>
  import { tick } from "svelte";
  import { getContext, onDestroy, onMount } from "svelte";

  import Card from "./components/Card.svelte";
  import { createStore } from "./store.js";

  export let locals;
  export let scope;
  export let instruction;
  export let trajectory;

  const store = createStore({ locals });
  const handleInput = (event) => store.setInput(event.target.value);

  $: if (scope && instruction) {
    store.update((s) => ({ ...s, scope, instruction }));
  }

  let inputState = "";
  $: if ($store.evaluation)
    switch ($store.evaluation.sentence.status) {
      case "KNOWN":
        inputState = "input-success";
        break;
      case "NEUTRAL":
        inputState = "input-info";
        break;
      case "UNKNOWN":
        inputState = "input-error";
        break;
    }

  onMount(() => {
    trajectory.set(trajectory.signals.keyboard.Enter(), () => {
      if ($store.revealed) {
        store.finishTranslation();
      } else {
        store.commitTranslation();
      }
    });
  });
</script>

<div class="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 pt-[10vh] mb-[20vh]">
  <div class="flex flex-row items-center w-full justify-cente pb-20">
    <div class="card bg-base-200 w-1/2 mb-2 mr-2">
      <div class="card-body">
        <p class="text-base-content/60 text-sm">English:</p>
        <h2 class="card-title text-xl text-base-content italic">
          {$store.instruction.sentence.known}
        </h2>
      </div>
    </div>

    {#if $store.revealed}
      <div class="card bg-base-200 w-1/2">
        <div class="card-body">
          <p class="text-base-content/70 text-sm">Expected Spanish:</p>
          <h2 class="card-title text-xl text-base-content italic">
            {$store.instruction.sentence.learning}
          </h2>
        </div>
      </div>
    {/if}
  </div>

  {#if $store.revealed}
    <div class="card bg-base-neutral">
      <div class="card-body pt-0 pb-5">
        <label class="text-base-content/60 text-sm">Feedback:</label>
      </div>
    </div>

    {#if $store.evaluation}
      <div class="flex flex-row flex-wrap pb-20">
        {#each $store.evaluation.units as evaluation}
          <Card {...evaluation} />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<div class="fixed bottom-0 left-0 right-0 w-full bg-base-100 px-10 py-16">
  <div
    class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center">
    <input
      class={`input input-bordered ${inputState} w-full mr-2 `}
      type="text"
      placeholder="Spanish translation here..."
      bind:value={$store.input}
      autofocus
      on:input={handleInput} />
    {#if !$store.revealed}
      <button on:click={store.commitTranslation} class={`btn btn-neutral`} type="button">
        Review
      </button>
    {:else}
      <button on:click={store.finishTranslation} class={`btn btn-neutral`} type="button">
        Next Game
      </button>
    {/if}
  </div>
</div>

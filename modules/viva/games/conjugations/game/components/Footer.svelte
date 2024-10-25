<script>
  import { getStore } from "../store.js";
  const store = getStore();
</script>

<div class="fixed bottom-0 left-0 right-0 w-full bg-base-100/80 py-6">
  <div class="container mx-auto flex items-center justify-center">
    {#if !$store.revealed}
      <button
        on:click={store.evaluate}
        class={`btn btn-accent ${Object.keys($store.inputs).length !== 6 && "btn-outline"}`}
        type="button">Check</button
      >
    {:else}
      <button on:click={store.finish} class={`btn btn-accent btn`} type="button">Next</button>
    {/if}
  </div>
</div>

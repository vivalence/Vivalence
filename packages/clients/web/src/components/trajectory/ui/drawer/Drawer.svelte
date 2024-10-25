<script>
  import trajectory from "$trajectory";

  $: ({ map, mode } = trajectory);

  let signals = [];
  $: {
    signals = [];
    for (const [signal] of $map) {
      if (!["keyboard"].includes(signal.type)) signals.push(signal);
    }
  }
</script>

{#if $mode !== "closed"}
  <div
    class={`fixed bottom-0 left-0 right-0 h-full w-full backdrop-blur-sm transition-all duration-100 ease-in-out `}>
  </div>
  <div
    class={`fixed bottom-0 left-0 right-0 w-full bg-base-100 transition-all duration-100 ease-in-out px-8 py-5`}>
    <div class={`container m-auto flex justify-center bg-slate-100`}>
      {#each signals as signal (signal.id)}
        <div class={` mr-2`}>
          <svelte:component this={signal.component} {...signal} />
        </div>
      {/each}
    </div>
  </div>
{/if}

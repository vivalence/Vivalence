<script>
  import { Button } from "@vivalence/ui";
  import { tick, onMount } from "svelte";

  const { next, game, instruction, scope } = $props();

  const onNextButton = async () => {
    game.call(`/evaluate`, { scope });
    next(); // Must be last.
  };

  //onMount(() => {trajectory.set(trajectory.signals.keyboard.Enter(), next);});
</script>

<div class="bsp-node root">
  <div class="bsp-node v prose-container p-8">
    <div class="bsp-chain-end prose rounded-lg border border-skeleton-boundary-1 p-4 lg:p-8">
      {@html instruction.prose}
    </div>
  </div>

  <div
    class={`bsp-chain-end footer menu p-4 shadow-md border-t border-skeleton-boundary-1 flex justify-center gap-2`}>
    <div
      class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center">
      <Button size="xl" onclick={onNextButton}>Next</Button>
    </div>
  </div>
</div>

<style>
  .root {
    grid-template:
      "body " 1fr
      "footer" auto;
  }
  .prose-container {
    grid-area: body;
    grid-template: "left main right" 1fr 3fr 1fr;
    /* overflow-y: auto; */
  }
  .prose {
    grid-area: main;
  }

  .footer {
    grid-area: footer;
  }
</style>

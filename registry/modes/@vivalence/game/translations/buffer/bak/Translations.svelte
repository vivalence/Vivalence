<script>
  import { onMount, onDestroy } from "svelte";
  import { Text, Button, Input } from "@vivalence/interface";

  import Card from "./Card.svelte";

  let loading = $state(false);
  let evaluations = $state([]);
  let input = $state("");
  let revealed = $state(false);

  // const { instruction, runtime, scope, game, next, keybindings } = $props();
  const { buffer, instruction, ctx } = $props();
  const { sentence } = instruction.data;

  async function evaluate() {
    revealed = true;
    loading = true;
    const params = {
      sentence: { ...sentence, translation: input },
      scope: instruction.scope,
    };
    const { data, error } = await ctx.game.call("/evaluate", params);
    evaluations = data;
    loading = false;
  }

  const handleInput = (event) => (input = event.target.value);

  let inputState = $derived(
    {
      KNOWN: "input-success",
      NEUTRAL: "input-info",
      UNKNOWN: "input-error",
    }[evaluation?.sentence.status],
  );

  const onEvaluate = () => evaluate();
  const onNext = () => buffer.release();

  // keybindings({Enter: () => {console.log("Enter trasn", sentence, revealed); if (!revealed) onEvaluate(); else onNext();},});
</script>

<div class="bsp-node root">
  <div class="bsp-node content">
    <div
      class="container mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 pt-[10vh] mb---[20vh]">
      <div class="flex flex-col items-center w-full justify-center pb-8">
        <div class="w-full mb-2">
          <Text size="sm">English:</Text>
          <Text size="xl" italic>{sentence.known}</Text>
        </div>

        {#if revealed}
          <div class="w-full mb-2">
            <Text size="sm">Expected:</Text>
            <Text size="xl" italic>{sentence.learning}</Text>
          </div>
          <div class="w-full mb-2">
            <Text size="sm">Given:</Text>
            <Text size="xl" italic>{input}</Text>
          </div>
        {/if}
      </div>

      {#if revealed}
        <div>
          <div>
            {#if evaluations.length > 0}
              <Text size="sm">Feedback:</Text>
            {/if}
            {#if loading}
              <Text size="md">Loading...</Text>
            {/if}
          </div>

          {#if evaluations}
            <div class="flex flex-col flex-wrap">
              {#each evaluations as evaluation}
                <Card {...evaluation} />
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div
    class="bsp-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1">
    <div
      class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center">
      <Input
        class={`input input-bordered ${inputState} w-full mr-2`}
        placeholder="Spanish translation here..."
        type="text"
        size="xl"
        autofocus
        disabled={revealed}
        bind:value={input}
        oninput={handleInput} />

      {#if !revealed}
        <Button size="xl" onclick={onEvaluate}>Commit</Button>
      {:else}
        <Button size="xl" onclick={onNext}>Next</Button>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    /* border: 1px solid red; */
  }
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    /* display: grid; */
    /* grid-template-columns: repeat(6, 1fr); */
    /* grid-template-rows: repeat(6, 1fr); */
    /* @apply rounded-lg border border-skeleton-boundary-1 */
  }

  .menu {
    grid-template-columns: 1fr;
    align-items: center;
  }
</style>

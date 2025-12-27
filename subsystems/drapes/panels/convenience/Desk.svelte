<script>
  import { onMount, onDestroy } from "svelte";
  import { Textarea, Text, Button } from "@vivalence/drapes";

  let { children, onSubmit, input = $bindable("") } = $props();

  let loading = $state(false);

  async function submitResponse() {
    loading = true;
    await onSubmit();
    loading = false;
  }
</script>

<div class="bsp-node v2">
  <div class="bsp-node children">
    {@render children?.()}
  </div>

  <div class="bsp-node p-24 pb-14 grid-rows-[1fr_auto] gap-2">
    <div class="bsp-node">
      <Textarea mode="default" size="xl" autofocus bind:value={input}
      ></Textarea>
    </div>
    <div class="bsp-node self-end justify-self-end">
      <Button
        variant={"primary"}
        onclick={submitResponse}
        {loading}
        disabled={loading}>Submit</Button>
    </div>
  </div>
</div>

<!-- <div class="bsp-node prompt p-24 pt-32"> {#if loading} <Text size="lg">Thinking...</Text> {:else} <Text size="xl">{@html prompt}</Text> {/if} </div> -->

<style>
  * {
    /* border: 1px solid yellow; */
  }
  .children {
  }
  .response {
  }
</style>

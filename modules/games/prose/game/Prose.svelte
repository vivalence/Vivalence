<script>
  /* import { Text, Button } from "@vivalence/ui"; */
  import { tick, onMount } from "svelte";

  /* export let locals;
   * export let game;
   * export let scope;
   * export let instruction;
   * export let trajectory; */
  const { ...props } = $props();
  console.log("prose props", props);

  const next = async () => {
    console.log("this.game.call(eval) not implemented");
    /* locals.onGameFinish(); */
    /* await locals.call(`/g/${game.slug}/evaluate`, { scope }); */
  };

  onMount(() => {
    /* trajectory.set(trajectory.signals.keyboard.Enter(), next); */
  });
</script>

<div
  class="container mx-auto w-full max-w-screen-md px-4 sm:px-6 lg:px-8 pt-[10vh] mb-[20vh] pb-20">
  <!-- <div class="prose">{@html instruction.prose}</div> -->
</div>

<div class="fixed bottom-0 left-0 right-0 w-full bg-base-100 px-10 py-16">
  <div
    class="container max-w-screen-md px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-center">
    <button onclick={next} class={`btn btn-neutral`} type="button">Next</button>
  </div>
</div>

<script>
  import Component from "./Component.svelte";
  import { onMount } from "svelte";

  export let bundle;
  export let data;

  export let trajectory;
  export let locals;

  let component = null;

  async function fetchAndCompileAST() {
    const data = await locals.call.raw(bundle, null, { method: "GET" });
    const text = await data.text();
    const blob = new Blob([text], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const { default: Game } = await import(/* @vite-ignore */ url);
    component = Game;
  }

  onMount(() => {
    fetchAndCompileAST();
  });
</script>

{#if Component}
  <Component this={component} {...data} {trajectory} {locals} />
{:else}
  <p>Loading component...</p>
{/if}

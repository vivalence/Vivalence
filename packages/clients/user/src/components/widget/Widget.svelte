<script>
import Component from './Component.svelte'
import { onMount } from 'svelte';

export let bundle;
export let data;
export let matrix;
export let locals;

let component = null;

async function fetchAndCompileAST() {
  const {default: Game} =  await import(/* @vite-ignore */ bundle)
  component = Game
}

onMount(() => {
    fetchAndCompileAST();
});

</script>

{#if Component}
  <Component this={component} {...data} {matrix} {locals}/>
{:else}
  <p>Loading component...</p>
{/if}





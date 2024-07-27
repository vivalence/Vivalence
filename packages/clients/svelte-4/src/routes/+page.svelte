<script>
import Widget from './Widget.svelte'
import { onMount } from 'svelte';
let Component = null;

async function fetchAndCompileAST() {
  const url = 'http://localhost:5175/runtime/lud-eng2esp/game/game.js'
  const {default: Game} =  await import(/* @vite-ignore */ url)
  console.log('Game', Game)
  // Component = Game.Component
  Component = Game
}

onMount(() => {
    fetchAndCompileAST();
});

$: console.log('Component',Component)

</script>

{#if Component}
  <h1>Welcome to SvelteKit</h1>
  <Widget this={Component} prop="Foo" otherProp="Bar" />
{:else}
  <p>Loading component...</p>
{/if}






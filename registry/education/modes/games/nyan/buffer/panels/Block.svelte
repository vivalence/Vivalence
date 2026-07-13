<script>
  // BLOCK layout — words wrap in a paragraph; the current word scrolls into view.
  import Word from "./Word.svelte";
  import Caret from "./Caret.svelte";

  const { view, glosses } = $props();
  let textElement = $state(null);

  // keep the current word visible as the paragraph wraps
  $effect(() => {
    if (!view || !textElement) return;
    const element =
      document.getElementById(`e-${view.wordIndex}`) ??
      document.getElementById(`c-${view.wordIndex}-0`);
    element?.scrollIntoView({ block: "nearest" });
  });
</script>

<div class="words" bind:this={textElement}>
  <Caret {view} frame={textElement} />
  {#each view.words as _, wordIndex}
    <Word {view} {glosses} {wordIndex} />
  {/each}
</div>

<style>
  .words {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.7rem;
    width: 100%;
    max-width: 720px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xl);
    line-height: 1.9;
    max-height: 24rem;
    overflow-y: auto;
  }
</style>

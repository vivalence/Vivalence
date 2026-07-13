<script>
  // RIVER layout — the current word is pinned at stage center; past words trail left,
  // upcoming queue right, the whole track gliding one word left on each commit
  // (word-pinned). The caret lives INSIDE the track so the glide carries it — no drift.
  import Word from "./Word.svelte";
  import Caret from "./Caret.svelte";

  const { view, glosses } = $props();
  let stage = $state(null);
  let track = $state(null);

  // gentle depth — neighbours stay legible, only the far ends fade (plus the edge mask)
  const depth = (distance) => Math.max(0.4, 1 - Math.abs(distance) * 0.12);
  const scale = (distance) => Math.max(0.92, 1 - Math.abs(distance) * 0.025);

  const recenter = () => {
    if (!stage || !track) return;
    const slot = track.children[view.wordIndex];
    if (!slot) return;
    const target = stage.clientWidth / 2 - (slot.offsetLeft + slot.offsetWidth / 2);
    track.style.transform = `translate(${target}px, -50%)`;
  };

  // depends on wordIndex only — the word holds still while typed, then glides on commit
  $effect(() => {
    view.wordIndex;
    view.words.length;
    recenter();
  });

  // settle after fonts load + on resize — the on-load off-centre fix
  $effect(() => {
    if (typeof document === "undefined" || !stage) return;
    document.fonts?.ready?.then(recenter);
    const observer = new ResizeObserver(recenter);
    observer.observe(stage);
    return () => observer.disconnect();
  });
</script>

<div class="stage" bind:this={stage}>
  <div class="track" bind:this={track}>
    {#each view.words as _, wordIndex}
      {@const distance = wordIndex - view.wordIndex}
      <span class="slot" style:opacity={depth(distance)} style:transform="scale({scale(distance)})">
        <Word {view} {glosses} {wordIndex} />
      </span>
    {/each}
    <Caret {view} frame={track} />
  </div>
</div>

<style>
  .stage {
    position: relative;
    width: 100%;
    height: 6rem;
    overflow: hidden;
    font-family: var(--font-family-code);
    font-size: var(--font-size-lg);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent);
  }
  .track {
    position: absolute;
    top: 50%;
    left: 0;
    display: flex;
    flex-wrap: nowrap;
    gap: 0 1.2rem;
    white-space: nowrap;
    transform: translate(0, -50%);
    transition: transform 0.18s ease;
    will-change: transform;
  }
  .slot {
    display: inline-flex;
    align-items: center;
    transform-origin: center;
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
</style>

<script>
  import { atom } from "@vivalence/typology";

  const { buffer, terminal } = $props();
  const data = atom.chain(buffer, "$data");

  // "play" the card. under any managed phase the stall consumes + advances (and the
  // terminal's on.release hook evicts). under INERT (the app owns release) the card
  // evicts itself, so the table still moves on.
  function play() {
    buffer.release();
    if (terminal.stall?.$phase?.get?.() !== "inert") return;
    terminal.thread.daemon.entities.buffer.drop(buffer.id);
    terminal.thread.daemon.entities.buffer.removeOne({ id: buffer.id });
    if (terminal.buffer?.id === buffer.id) terminal.buffer = null;
  }
</script>

<div class="card">
  <div class="face">{$data?.face ?? "?"}</div>
  <button class="play" onclick={play}>play ✓</button>
</div>

<style>
  .card {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
  }
  .face {
    font-size: var(--font-size-6xl);
    letter-spacing: 0.04em;
  }
  .play {
    padding: 0.4rem 1.1rem;
    font: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 0.3rem;
    cursor: pointer;
  }
  .play:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
</style>

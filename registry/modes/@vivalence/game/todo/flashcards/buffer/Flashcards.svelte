<script>
  import { words, sentences, pickOne } from "../../data.js";

  const pool = [
    ...words.map((w) => ({ ...w, type: "word" })),
    ...sentences.map((s) => ({ ...s, type: "sentence" })),
  ];

  let item = $state(pickOne(pool));
  let direction = $state(Math.random() > 0.5 ? "l1l2" : "l2l1");
  let revealed = $state(false);

  const front = $derived(direction === "l1l2" ? item.known : item.learning);
  const back = $derived(direction === "l1l2" ? item.learning : item.known);
  const frontLabel = $derived(direction === "l1l2" ? "English" : "Português");
  const backLabel = $derived(direction === "l1l2" ? "Português" : "English");

  function reveal() { revealed = true; }

  function next() {
    item = pickOne(pool);
    direction = Math.random() > 0.5 ? "l1l2" : "l2l1";
    revealed = false;
  }

  function handleKey(e) {
    if (e.key === " " && !e.target.closest("input,textarea")) {
      e.preventDefault();
      if (!revealed) reveal();
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">

      <div class="card-front" class:tappable={!revealed} onclick={!revealed ? reveal : undefined}>
        <div class="meta">
          <span class="tag tag-front">{frontLabel}</span>
          <span class="tag tag-muted">{item.type}</span>
          {#if item.level}<span class="tag tag-muted">{item.level}</span>{/if}
        </div>
        <p class="prompt" class:prompt-word={item.type === "word"}>{front}</p>
        {#if !revealed}
          <span class="hint">tap to reveal</span>
        {/if}
      </div>

      {#if revealed}
        <div class="card-back">
          <div class="meta">
            <span class="tag tag-back">{backLabel}</span>
          </div>
          <p class="prompt answer" class:prompt-word={item.type === "word"}>{back}</p>
        </div>
      {/if}

    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="actions">
      {#if revealed}
        <button class="btn btn-unknown" onclick={() => next()}>Unknown</button>
        <button class="btn btn-known" onclick={() => next()}>Known</button>
        <button class="btn btn-easy" onclick={() => next()}>Easy</button>
      {:else}
        <button class="btn btn-reveal" onclick={reveal}>Reveal</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .root { grid-template-rows: 1fr auto; }
  .content { overflow-y: auto; }

  .stage {
    max-width: 520px;
    width: 100%;
    margin: 0 auto;
    padding: 12vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-front, .card-back {
    border-radius: 1rem;
    padding: 1.75rem 1.5rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
  }

  .card-front {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    border: 1px solid var(--colors-skeleton-1-boundary);
  }

  .card-front.tappable { cursor: pointer; }

  .card-back {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 25%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-theme-primary-boundary) 40%, transparent);
  }

  .meta { display: flex; gap: 0.375rem; }

  .tag {
    padding: 0.15rem 0.5rem;
    border-radius: 0.25rem;
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .tag-front {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 60%, transparent);
    color: var(--colors-theme-primary-contrast);
  }

  .tag-back {
    background: color-mix(in srgb, var(--colors-theme-accent-surface) 50%, transparent);
    color: var(--colors-theme-accent-contrast);
  }

  .tag-muted {
    background: var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-1-contrast);
    font-weight: 500;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.25;
    margin: 0;
  }

  .prompt-word { font-size: var(--font-size-3xl); }
  .answer { color: var(--colors-theme-primary-contrast); }

  .hint {
    position: absolute;
    bottom: 0.75rem;
    right: 1rem;
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1rem 1.25rem;
  }

  .actions {
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    gap: 0.625rem;
  }

  .btn {
    flex: 1;
    padding: 0.875rem 0.5rem;
    border-radius: 0.625rem;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  .btn-unknown { background: var(--colors-system-error-surface); color: var(--colors-system-error-contrast); }
  .btn-known { background: var(--colors-system-success-surface); color: var(--colors-system-success-contrast); }
  .btn-easy { background: var(--colors-theme-primary-surface); color: var(--colors-theme-primary-contrast); }
  .btn-reveal { background: transparent; border: 1px solid var(--colors-skeleton-1-boundary); color: var(--colors-skeleton-1-contrast); }

  @media (max-width: 640px) {
    .stage { padding-top: 8vh; }
    .card-front, .card-back { padding: 1.25rem 1.125rem; min-height: 100px; }
    .prompt { font-size: var(--font-size-xl); }
    .prompt-word { font-size: var(--font-size-2xl); }
    .menu { padding: 0.75rem 1rem; }
  }
</style>

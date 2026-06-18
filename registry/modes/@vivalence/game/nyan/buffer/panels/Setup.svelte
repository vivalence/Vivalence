<script>
  import { GAMEPLAYS } from "../engine.js";

  const { game, sets } = $props();

  const gameplays = Object.keys(GAMEPLAYS);
  const nextGameplay = () => {
    const index = gameplays.indexOf(game.config.gameplay);
    game.config.gameplay = gameplays[(index + 1) % gameplays.length];
  };
</script>

<h2 class="title">typer · setup</h2>
<div class="setup">
  <label class="row">
    <span class="key">source</span>
    <select bind:value={game.config.source}>
      {#each sets as set}<option value={set.name}>{set.label}</option>{/each}
      <option value="custom">custom…</option>
    </select>
  </label>
  {#if game.config.source === "custom"}
    <label class="row">
      <span class="key">words</span>
      <textarea rows="3" bind:value={game.config.custom} placeholder="paste words…"></textarea>
    </label>
  {/if}
  <label class="row">
    <span class="key">count</span>
    <input type="number" min="5" step="5" bind:value={game.config.count} />
  </label>
  <label class="row">
    <span class="key">gameplay</span>
    <button type="button" class="toggle" onclick={nextGameplay}>
      {game.config.gameplay.toLowerCase()}
    </button>
  </label>
  <label class="row">
    <span class="key">forgiving</span>
    <button
      type="button"
      class="toggle"
      onclick={() => (game.config.forgiving = game.config.forgiving === "on" ? "off" : "on")}>
      {game.config.forgiving}
    </button>
  </label>
  <label class="row">
    <span class="key">recall ms</span>
    <input type="number" min="500" step="250" bind:value={game.config.recallMs} />
  </label>
  <label class="row">
    <span class="key">live stats</span>
    <button
      type="button"
      class="toggle"
      onclick={() => (game.config.live = game.config.live === "shown" ? "hidden" : "shown")}>
      {game.config.live}
    </button>
  </label>
</div>

<style>
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--colors-palette-gray-10);
    margin: 0 0 1.25rem 0;
  }
  .setup {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 360px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    width: 6.5rem;
    flex-shrink: 0;
  }
  .row select,
  .row input,
  .row textarea {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.6rem;
    border-radius: 0.375rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
    color: var(--colors-palette-gray-10);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    outline: none;
    box-sizing: border-box;
  }
  .toggle {
    padding: 0.4rem 0.9rem;
    border-radius: 0.375rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-theme-primary-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    cursor: pointer;
  }
</style>

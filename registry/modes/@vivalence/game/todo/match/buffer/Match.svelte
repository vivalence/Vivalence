<script>

  import { matchGroups, pickOne, shuffle } from "../../data.js";

  let group = $state(null);
  let leftCol = $state([]);
  let rightCol = $state([]);
  let sel = $state(null);
  let matched = $state(new Set());
  let wrong = $state(null);

  function generate() {
    group = pickOne(matchGroups);
    leftCol = shuffle(group.pairs.map((p, i) => ({ ...p, id: i })));
    rightCol = shuffle(group.pairs.map((p, i) => ({ ...p, id: i })));
    sel = null;
    matched = new Set();
    wrong = null;
  }

  generate();

  function tap(side, pair) {
    if (matched.has(pair.id)) return;
    wrong = null;

    if (!sel) { sel = { side, id: pair.id }; return; }
    if (sel.side === side) { sel = { side, id: pair.id }; return; }

    if (sel.id === pair.id) {
      matched = new Set([...matched, pair.id]);
      sel = null;
    } else {
      wrong = { side, id: pair.id };
      sel = null;
    }
  }

  const done = $derived(matched.size === group?.pairs.length);

  function cellState(side, pair) {
    if (matched.has(pair.id)) return "matched";
    if (sel?.side === side && sel?.id === pair.id) return "selected";
    if (wrong?.side === side && wrong?.id === pair.id) return "wrong";
    return "idle";
  }
</script>

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">

      <div class="header">
        <span class="title">{group?.title}</span>
        <span class="count">{matched.size}/{group?.pairs.length}</span>
      </div>

      <div class="grid">
        <div class="col">
          {#each leftCol as pair (pair.id)}
            {@const state = cellState("left", pair)}
            <button class="cell cell-{state}" onclick={() => tap("left", pair)}>
              {pair.left}
            </button>
          {/each}
        </div>
        <div class="col">
          {#each rightCol as pair (pair.id)}
            {@const state = cellState("right", pair)}
            <button class="cell cell-{state}" onclick={() => tap("right", pair)}>
              {pair.right}
            </button>
          {/each}
        </div>
      </div>

    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="menu-inner">
      {#if done}
        <button class="btn-next" onclick={generate}>Next Group →</button>
      {:else}
        <span class="menu-hint">tap left then right to match</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .root { grid-template-rows: 1fr auto; }
  .content { overflow-y: auto; }

  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 12vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  .title {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
  }

  .count {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cell {
    padding: 1rem 0.75rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--colors-palette-gray-100);
    font-size: var(--font-size-xl);
    font-family: var(--font-family-serif-heading);
    cursor: pointer;
    text-align: center;
    transition: all 0.12s;
  }

  .cell-matched {
    background: color-mix(in srgb, var(--colors-system-success-surface) 70%, transparent);
    border-color: var(--colors-system-success-contrast);
    color: var(--colors-system-success-contrast);
    opacity: 0.55;
    cursor: default;
  }

  .cell-selected {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 60%, transparent);
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }

  .cell-wrong {
    background: color-mix(in srgb, var(--colors-system-error-surface) 60%, transparent);
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1rem 1.25rem;
  }

  .menu-inner { max-width: 480px; margin: 0 auto; }

  .btn-next {
    width: 100%;
    padding: 0.875rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  .menu-hint {
    display: block;
    text-align: center;
    padding: 0.875rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.75rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .stage { padding-top: 8vh; }
    .cell { font-size: var(--font-size-lg); padding: 0.875rem 0.5rem; }
    .menu { padding: 0.75rem 1rem; }
  }
</style>

<script>
  import { Keyboard } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const recall = data.recall ?? "LEARNING";
  const gameplay = data.gameplay ?? "translate";
  const descriptions = data.descriptions ?? [];

  let literals = $state(buffer.literals ?? []);
  let loading = $state(!literals.length);

  let leftItems = $state([]);
  let rightItems = $state([]);
  let selectedLeft = $state(null);
  let connections = $state([]);
  let failed = $state(new Set());
  let errored = new Set();

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function leftText(lit, i) {
    if (gameplay === "describe" && descriptions[i] !== undefined) {
      return descriptions[literals.indexOf(lit)];
    }
    return recall === "LEARNING"
      ? lit?.trait?.TRANSLATED?.known
      : lit?.trait?.TRANSLATED?.learning;
  }

  function rightText(lit) {
    return recall === "LEARNING"
      ? lit?.trait?.TRANSLATED?.learning
      : lit?.trait?.TRANSLATED?.known;
  }

  function init(lits) {
    leftItems = shuffle([...lits]);
    rightItems = shuffle([...lits]);
    connections = [];
    failed = new Set();
    errored = new Set();
    selectedLeft = null;
  }

  if (!literals.length) {
    terminal.daemon.call("/pick/literal/feed", { take: 4 }).then((lits) => {
      literals = lits ?? [];
      init(literals);
      loading = false;
    });
  } else {
    init(literals);
  }

  const connected = $derived(new Set(connections.map((c) => c.id)));
  const allMatched = $derived(literals.length > 0 && connections.length === literals.length);

  function tapLeft(lit) {
    if (connected.has(lit.id)) return;
    selectedLeft = lit;
  }

  function tapRight(lit) {
    if (!selectedLeft) return;
    if (connected.has(lit.id)) return;

    const isCorrect = selectedLeft.id === lit.id;

    if (isCorrect) {
      connections = [...connections, { id: lit.id }];
    } else {
      errored.add(selectedLeft.id);
      errored.add(lit.id);
      failed = new Set([...failed, selectedLeft.id, lit.id]);
      const a = selectedLeft.id, b = lit.id;
      setTimeout(() => {
        failed = new Set([...failed].filter((id) => id !== a && id !== b));
      }, 400);
    }

    selectedLeft = null;

    if (connections.length + (isCorrect ? 0 : 0) === literals.length - (isCorrect ? 0 : 0)) {
      checkComplete();
    }
  }

  function checkComplete() {
    if (connections.length !== literals.length) return;

    for (const lit of literals) {
      terminal.daemon.call("/review/literal", {
        signal: errored.has(lit.id) ? "FAILURE" : "SUCCESS",
        scope: { literal: lit.id },
      });
    }

    buffer.release();
  }

  $effect(() => {
    if (allMatched) checkComplete();
  });
</script>

<Keyboard bind:this={keyboard} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">
      {#if literals.length}
        <div class="meta">
          <span class="meta-lang">{gameplay === "describe" ? "match" : (recall === "LEARNING" ? "English → Português" : "Português → English")}</span>
          <span class="meta-count">{connections.length}/{literals.length}</span>
        </div>

        <div class="grid">
          <div class="column">
            {#each leftItems as lit}
              {@const isConnected = connected.has(lit.id)}
              {@const isSelected = selectedLeft?.id === lit.id}
              {@const isFailed = failed.has(lit.id)}
              <button
                class="cell"
                class:cell-connected={isConnected}
                class:cell-selected={isSelected}
                class:cell-failed={isFailed && !isConnected}
                ontouchstart={(e) => keyboard.guard(e)}
                onclick={() => tapLeft(lit)}
                disabled={isConnected}
              >
                {leftText(lit, leftItems.indexOf(lit))}
              </button>
            {/each}
          </div>

          <div class="column">
            {#each rightItems as lit}
              {@const isConnected = connected.has(lit.id)}
              {@const isFailed = failed.has(lit.id)}
              <button
                class="cell"
                class:cell-connected={isConnected}
                class:cell-failed={isFailed && !isConnected}
                ontouchstart={(e) => keyboard.guard(e)}
                onclick={() => tapRight(lit)}
                disabled={isConnected}
              >
                {rightText(lit)}
              </button>
            {/each}
          </div>
        </div>

      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="input-row">
      {#if loading}
        <span class="menu-hint">loading…</span>
      {:else if allMatched}
        <span class="menu-hint">complete</span>
      {:else if selectedLeft}
        <span class="menu-hint">now tap the match</span>
      {:else}
        <span class="menu-hint">tap a pair to connect</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .root { grid-template-rows: 1fr auto; }
  .content { overflow-y: auto; }

  .stage {
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
    padding: 8vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }
  .meta-lang {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
  }
  .meta-count {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cell {
    padding: 0.75rem 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--colors-palette-gray-100);
    font-size: var(--font-size-base);
    font-family: var(--font-family-serif-heading);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
    line-height: 1.3;
  }
  .cell:hover:not(:disabled) {
    border-color: var(--colors-skeleton-1-contrast);
  }

  .cell-selected {
    border-color: var(--colors-theme-primary-contrast);
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 40%, transparent);
  }

  .cell-connected {
    opacity: 0.25;
    pointer-events: none;
    border-color: var(--colors-system-success-contrast);
  }

  .cell-failed {
    border-color: var(--colors-system-error-contrast);
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 4rem;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px));
  }
  .input-row {
    max-width: 560px;
    margin: 0 auto;
  }
  .menu-hint {
    display: block;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .stage { padding-top: 3vh; padding-left: 0.75rem; padding-right: 0.75rem; }
    .cell { font-size: var(--font-size-sm); font-family: var(--font-family-sans-text); padding: 0.75rem 0.625rem; min-height: 3rem; display: flex; align-items: center; }
    .grid { gap: 0.5rem; }
    .column { gap: 0.375rem; }
    .menu { padding: 1.25rem 1rem calc(1.25rem + env(safe-area-inset-bottom, 0px)); }
    .menu-hint { padding: 0.75rem; font-size: 0.85rem; }
  }
</style>

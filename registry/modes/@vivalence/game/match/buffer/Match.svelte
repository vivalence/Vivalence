<script>
  import { Desk } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const recall = data.recall ?? "LEARNING";
  const gameplay = data.gameplay ?? "TRANSLATE";
  const descriptions = data.descriptions ?? [];

  let literals = $state(buffer.literals ?? []);
  let loading = $state(!literals.length);

  let leftItems = $state([]);
  let rightItems = $state([]);
  let selected = $state(null);
  let selectedSide = $state(null);
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
    if (gameplay === "DESCRIBE" && descriptions[i] !== undefined) {
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

  function exampleFor(lit, side) {
    if (gameplay === "DESCRIBE") return null;
    const example = lit?.trait?.EXEMPLIFIED;
    if (!example) return null;
    const field = side === "left"
      ? (recall === "LEARNING" ? "known" : "learning")
      : (recall === "LEARNING" ? "learning" : "known");
    return example[field];
  }

  function init(lits) {
    leftItems = shuffle([...lits]);
    rightItems = shuffle([...lits]);
    connections = [];
    failed = new Set();
    errored = new Set();
    selected = leftItems[0];
    selectedSide = "left";
  }

  if (!literals.length) {
    terminal.daemon.call("/pick/literal/feed", { limit: 4 }).then((lits) => {
      literals = lits ?? [];
      init(literals);
      loading = false;
    });
  } else {
    init(literals);
  }

  const connected = $derived(new Set(connections.map((c) => c.id)));
  const allMatched = $derived(literals.length > 0 && connections.length === literals.length);

  function tap(lit, side) {
    if (connected.has(lit.id)) return;

    if (!selected || selectedSide === side) {
      selected = lit;
      selectedSide = side;
      return;
    }

    const isCorrect = selected.id === lit.id;

    if (isCorrect) {
      connections = [...connections, { id: lit.id }];
    } else {
      errored.add(selected.id);
      errored.add(lit.id);
      failed = new Set([...failed, selected.id, lit.id]);
      const a = selected.id, b = lit.id;
      setTimeout(() => {
        failed = new Set([...failed].filter((id) => id !== a && id !== b));
      }, 400);
    }

    selected = null;
    selectedSide = null;

    if (isCorrect && connections.length === literals.length - 1) {
      const matched = new Set(connections.map(c => c.id));
      const last = literals.find(l => !matched.has(l.id));
      setTimeout(() => {
        connections = [...connections, { id: last.id }];
        setTimeout(() => checkComplete(), 800);
      }, 300);
      return;
    }

    if (connections.length === literals.length) {
      checkComplete();
    }
  }

  function checkComplete() {
    if (connections.length !== literals.length) return;

    for (const lit of literals) {
      terminal.daemon.call("/review/literal", {
        signal: errored.has(lit.id) ? "MISTAKE" : "SUCCESS",
        scope: { literal: lit.id },
      });
    }

    buffer.release();
  }

</script>

<Desk maxWidth="560px">
  {#snippet surface()}
    {#if literals.length}
      <div class="meta">
        <span class="meta-lang">{gameplay === "DESCRIBE" ? "match" : (recall === "LEARNING" ? "English → Português" : "Português → English")}</span>
        <span class="meta-count">{connections.length}/{literals.length}</span>
      </div>

      <div class="grid">
        <div class="column">
          {#each leftItems as lit}
            {@const isConnected = connected.has(lit.id)}
            {@const isSelected = selected?.id === lit.id && selectedSide === "left"}
            {@const isFailed = failed.has(lit.id)}
            {@const revealExample = selected && !isConnected && (isSelected || selectedSide === "right")}
            {@const example = revealExample ? exampleFor(lit, "left") : null}
            <button
              class="cell"
              class:cell-connected={isConnected}
              class:cell-selected={isSelected}
              class:cell-failed={isFailed && !isConnected}
              onmousedown={(e) => e.preventDefault()}
              onclick={() => tap(lit, "left")}
              disabled={isConnected}
            >
              <span class="cell-text">{leftText(lit, leftItems.indexOf(lit))}</span>
              {#if example}
                <span class="cell-example">{example}</span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="column">
          {#each rightItems as lit}
            {@const isConnected = connected.has(lit.id)}
            {@const isSelected = selected?.id === lit.id && selectedSide === "right"}
            {@const isFailed = failed.has(lit.id)}
            {@const revealExample = selected && !isConnected && (isSelected || selectedSide === "left")}
            {@const example = revealExample ? exampleFor(lit, "right") : null}
            <button
              class="cell"
              class:cell-connected={isConnected}
              class:cell-selected={isSelected}
              class:cell-failed={isFailed && !isConnected}
              onmousedown={(e) => e.preventDefault()}
              onclick={() => tap(lit, "right")}
              disabled={isConnected}
            >
              <span class="cell-text">{rightText(lit)}</span>
              {#if example}
                <span class="cell-example">{example}</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>

    {:else if loading}
      <div class="loading"><span class="dot"></span></div>
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if loading}
      <span class="menu-hint">loading…</span>
    {:else if allMatched}
      <span class="menu-hint">complete</span>
    {:else if selected}
      <span class="menu-hint">now tap the match</span>
    {:else}
      <span class="menu-hint">tap a pair to connect</span>
    {/if}
  {/snippet}
</Desk>

<style>

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
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-height: 48px;
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
  .cell-text {
    display: block;
  }
  .cell-example {
    display: block;
    font-family: var(--font-family-sans-text);
    font-size: 0.7rem;
    line-height: 1.35;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
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

  .menu-hint {
    display: block;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .cell { font-size: var(--font-size-sm); font-family: var(--font-family-sans-text); padding: 0.75rem 0.625rem; min-height: 48px; display: flex; align-items: center; }
    .grid { gap: 0.5rem; }
    .column { gap: 0.375rem; }
  }
</style>

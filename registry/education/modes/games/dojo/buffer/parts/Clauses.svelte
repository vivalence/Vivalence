<script>
  import { visible } from "@vivalence/drapes";
  import { describe } from "../../set/describe.js";

  const { clauses = [], total = 0, resolving = false, editingIndex = null, onedit, onremove, onclear, onsave } = $props();

  const PREVIEW = 5;

  let naming = $state(false);
  let name = $state("");

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onsave(trimmed);
    naming = false;
    name = "";
  }
</script>

<div class="set">
  <div class="head">
    <span class="title">the set</span>
    <span class="total">{resolving ? "…" : total}</span>
    <span class="unit">subjects</span>
    {#if clauses.length}
      <button class="ghost" onclick={() => (naming = !naming)}>{naming ? "later" : "save"}</button>
      <button class="ghost danger" onclick={onclear}>clear</button>
    {/if}
  </div>
  {#if naming}
    <div class="naming">
      <input
        class="field"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        writingsuggestions="false"
        use:visible={{ block: "center" }}
        value={name}
        oninput={(event) => (name = event.target.value)}
        onkeydown={(event) => {
          if (event.key === "Enter") save();
          if (event.key === "Escape") naming = false;
        }}
        placeholder="name this set — verbi al presente…" />
      <button class="ok" onclick={save}>⏎</button>
    </div>
  {/if}
  <div class="cards">
    {#each clauses as entry, index (index)}
      {@const pinned = entry.clause.pick === "literals"}
      <div class="card" class:editing={editingIndex === index}>
        <div class="card-head">
          <span class="kind" class:pinned>{pinned ? "pinned" : entry.clause.pick === "authored" ? "authored" : "rule"}</span>
          <button class="label" title="load it back into the builder" onclick={() => onedit(index)}>{describe(entry.clause)}</button>
          <span class="count">{entry.count ?? "·"}</span>
          <span class="tools">
            <button class="tool" title="edit" aria-label="edit" onclick={() => onedit(index)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 13.5v-2.6l7-7 2.6 2.6-7 7H2.5z" /><path d="M10.4 3l1.5-1.5 2.6 2.6L13 5.6" /></svg>
            </button>
            <button class="tool danger" title="remove" aria-label="remove" onclick={() => onremove(index)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
            </button>
          </span>
        </div>
        <div class="preview">
          {#each entry.rows.slice(0, PREVIEW) as row (row.literal ?? row.learning)}
            <span class="crumb">{row.learning}</span>
          {/each}
          {#if entry.rows.length > PREVIEW}<span class="more">+{entry.rows.length - PREVIEW}</span>{/if}
          {#if !entry.rows.length}<span class="more">{resolving ? "resolving…" : "nothing survives this"}</span>{/if}
        </div>
      </div>
    {/each}
    {#if !clauses.length}
      <span class="empty">Empty. Build a rule and add it — or pin single literals. A rule clause re-resolves every time the set restarts; a pinned one never changes.</span>
    {/if}
  </div>
</div>

<style>
  .set {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    background: var(--colors-skeleton-0-surface);
  }
  .head {
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.75rem 0.9rem 0.4rem;
  }
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-support);
    opacity: 0.8;
  }
  .total {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-theme-primary-contrast);
  }
  .unit {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    flex: 1;
  }
  .ghost {
    border: none;
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0;
  }
  .ghost:hover {
    color: var(--colors-theme-primary-contrast);
  }
  .ghost.danger:hover {
    color: var(--colors-system-error-contrast);
  }
  .naming {
    flex: none;
    display: flex;
    gap: 0.3rem;
    padding: 0 0.9rem 0.5rem;
  }
  .field {
    flex: 1;
    min-width: 0;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-theme-primary-contrast);
    border-radius: 0.2rem;
    padding: 0.4rem 0.55rem;
    color: var(--text-primary);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    outline: none;
  }
  .ok {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0 0.6rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-theme-primary-contrast);
    background: transparent;
    color: var(--colors-theme-primary-contrast);
    cursor: pointer;
  }
  .cards {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 0.9rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .card {
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.2rem;
    background: var(--colors-skeleton-1-surface);
  }
  .card.editing {
    border-color: var(--colors-system-warning-contrast);
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.3rem 0.3rem 0.55rem;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    min-width: 0;
  }
  .kind {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-theme-primary-contrast);
    white-space: nowrap;
  }
  .kind.pinned {
    color: var(--colors-system-warning-contrast);
  }
  .label {
    flex: 1;
    min-width: 0;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label:hover {
    color: var(--colors-theme-primary-contrast);
  }
  .count {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    font-variant-numeric: tabular-nums;
    color: var(--colors-theme-primary-contrast);
  }
  .tools {
    display: flex;
    align-items: center;
    gap: 0.05rem;
    margin-left: -0.15rem;
  }
  .tool {
    border: none;
    border-radius: 0.2rem;
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex: none;
  }
  .tool:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .tool svg {
    width: 13px;
    height: 13px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .tool:hover {
    color: var(--colors-system-warning-contrast);
  }
  .tool.danger:hover {
    color: var(--colors-system-error-contrast);
  }
  .preview {
    padding: 0.35rem 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
  }
  .crumb {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    padding: 0.1rem 0.3rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.15rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .more {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.7;
    padding: 0.1rem 0.25rem;
  }
  .empty {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    line-height: 1.6;
  }
</style>

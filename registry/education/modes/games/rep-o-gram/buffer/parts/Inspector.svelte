<script>
  import { journal } from "../shell.svelte.js";

  const { narrow = false, session, sets, queue } = $props();

  const SIGNAL_TONE = {
    MASTERY: "var(--colors-theme-primary-contrast)",
    SUCCESS: "var(--colors-system-success-contrast)",
    NEUTRAL: "var(--colors-theme-secondary-contrast)",
    MISTAKE: "var(--colors-system-warning-contrast)",
    FAILURE: "var(--colors-system-error-contrast)",
  };

  const NARRATION_TONE = {
    primary: "var(--colors-theme-primary-contrast)",
    secondary: "var(--colors-theme-secondary-contrast)",
    success: "var(--colors-system-success-contrast)",
    warning: "var(--colors-system-warning-contrast)",
    error: "var(--colors-system-error-contrast)",
    support: "var(--text-support)",
  };

  let tab = $state("raw");

  const meta = $derived([
    `streak: ${session.streak}`,
    `attempts: ${session.attempts}`,
    `pending: ${session.pending.length}`,
    `sets: ${sets}`,
  ]);
</script>

<aside class="inspector" class:full={narrow}>
  <div class="tabs">
    <button class="tab" class:active={tab === "raw"} onclick={() => (tab = "raw")}>raw</button>
    <button class="tab" class:active={tab === "narrated"} onclick={() => (tab = "narrated")}>
      narrated
    </button>
  </div>

  {#if tab === "raw"}
    <div class="section-label">session · streak fold</div>
    <div class="meta">
      {#each meta as entry (entry)}
        <div class="meta-chip">{entry}</div>
      {/each}
    </div>

    <div class="section-label">pending queue</div>
    <div class="pending">
      {#each session.pending as entry, index (entry.index)}
        <div class="row" class:head={index === 0}>
          <span class="pos">{String(index).padStart(2, "0")}</span>
          <span class="label">{queue[entry.index]?.learning ?? "—"}</span>
          <span class="counts">runs {entry.runs} · reps {entry.reps}</span>
        </div>
      {/each}
      {#if !session.pending.length}
        <div class="empty">queue drained — every knowable satisfied</div>
      {/if}
    </div>

    <div class="section-label">/review/literal dispatches</div>
    <div class="dispatches">
      {#each journal.dispatches as dispatch, index (index)}
        <div class="dispatch">
          <span class="at">{dispatch.at}</span>
          <span class="literal">{dispatch.label}</span>
          <span class="signal" style:color={SIGNAL_TONE[dispatch.signal] ?? "var(--text-support)"}>
            {dispatch.signal}
          </span>
        </div>
      {/each}
      {#if !journal.dispatches.length}
        <div class="empty">nothing dispatched yet</div>
      {/if}
    </div>
  {:else}
    <div class="narration">
      {#each journal.narration as entry, index (index)}
        <div class="note" style:border-color={NARRATION_TONE[entry.tone] ?? "var(--text-support)"}>
          <div class="note-head" style:color={NARRATION_TONE[entry.tone] ?? "var(--text-support)"}>
            {entry.head}
          </div>
          <div class="note-body">{entry.body}</div>
        </div>
      {/each}
      {#if !journal.narration.length}
        <div class="empty">the machine narrates itself here as you drive it</div>
      {/if}
    </div>
  {/if}
</aside>

<style>
  .inspector {
    flex: none;
    width: 320px;
    box-sizing: border-box;
    background: var(--colors-skeleton-0-surface);
    border-left: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1.125rem 1.125rem 3.75rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .inspector.full {
    flex: 1;
    width: 100%;
    border-left: none;
  }
  .tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
  .tab {
    flex: 1;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 7px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .tab.active {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .section-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-support);
    margin-bottom: 0.5rem;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 1rem;
  }
  .meta-chip {
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 3px;
    padding: 6px 9px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-body);
  }
  .pending {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 1.125rem;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.5625rem;
    padding: 7px 10px;
    border-radius: 3px;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .row.head {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .pos {
    opacity: 0.6;
  }
  .label {
    flex: 1;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .counts {
    white-space: nowrap;
  }
  .dispatches {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .dispatch {
    display: flex;
    gap: 0.5rem;
    padding: 5px 0;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .at {
    color: var(--text-support);
    flex: none;
  }
  .literal {
    flex: 1;
    color: var(--text-body);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .signal {
    flex: none;
  }
  .narration {
    display: flex;
    flex-direction: column;
    gap: 0.5625rem;
  }
  .note {
    border-left: 2px solid;
    padding: 2px 0 2px 11px;
  }
  .note-head {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
  }
  .note-body {
    font-size: var(--font-size-xs);
    color: var(--text-body);
    margin-top: 3px;
    line-height: 1.5;
  }
  .empty {
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    padding: 0.375rem 0;
  }
</style>

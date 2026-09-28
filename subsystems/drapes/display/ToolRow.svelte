<script>
  import Status from "./Status.svelte";

  let { name = null, digest = null, status = null, tone = "positive", open = false, live = false, title = null, ontoggle = null, actions, children } = $props();
</script>

<div class="tool-row {tone}" class:open>
  {#if name}
    <div class="tool-head">
      <button class="tool-face" class:still={!ontoggle} {title} onclick={ontoggle}>
        <Status {tone} {live} pulse={live} />
        {#if ontoggle}<span class="tool-caret" class:turned={open}>▸</span>{/if}
        <span class="tool-name">{name}</span>
        {#if digest}<span class="tool-digest">{digest}</span>{/if}
        {#if status}<span class="tool-status">{status}</span>{/if}
      </button>
      {#if actions}<span class="tool-actions">{@render actions()}</span>{/if}
    </div>
    {#if open && children}<div class="tool-body">{@render children()}</div>{/if}
  {:else}
    <div class="tool-line">{@render children?.()}</div>
  {/if}
</div>

<style>
  .tool-row {
    --tool-ink: var(--signal-positive-ink);
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-radius: var(--shape-radius-key);
    background: var(--surface-lift);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .tool-row.primary {
    --tool-ink: var(--signal-primary-ink);
  }
  .tool-row.caution {
    --tool-ink: var(--signal-caution-ink);
  }
  .tool-row.negative {
    --tool-ink: var(--signal-negative-ink);
    box-shadow: 0 0 0 var(--size-ring) var(--signal-negative);
  }
  .tool-row.idle,
  .tool-row.none {
    --tool-ink: var(--text-light);
  }
  .tool-row.open {
    box-shadow: 0 0 0 var(--size-ring) var(--signal-primary-tint), 0 0 0 var(--size-ring) var(--boundary);
  }
  .tool-head,
  .tool-line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--size-row);
    min-width: 0;
    padding: 0 10px;
  }
  .tool-face {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--size-row);
    padding: 0;
    border: none;
    background: none;
    color: var(--text-strong);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .tool-face.still {
    cursor: default;
  }
  .tool-caret {
    flex: none;
    color: var(--text-light);
    transition: transform 0.12s;
  }
  .tool-caret.turned {
    transform: rotate(90deg);
  }
  .tool-name {
    flex: none;
    font-weight: 600;
  }
  .tool-digest {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
  .tool-status {
    flex: none;
    margin-left: auto;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--tool-ink);
  }
  .tool-actions {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .tool-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 10px 10px;
    border-top: var(--size-ring) solid var(--boundary);
  }
  @media (pointer: coarse) {
    .tool-face {
      min-height: 44px;
    }
  }
</style>

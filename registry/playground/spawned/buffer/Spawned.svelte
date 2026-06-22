<script>
  import { atom } from "@vivalence/typology";

  const { buffer, terminal } = $props();

  // re-renders on in-place merge updates to this buffer's data.
  const data = atom.chain(buffer, "$data");

  // report itself finished. under a STALL-driven phase the stall consumes + advances
  // (and the terminal's on.release hook evicts). With no managing phase (INERT — e.g.
  // selected straight from the F-panel list) nothing is listening, so evict it here so
  // the moat still moves on.
  function complete() {
    buffer.release();
    // any non-inert phase advances + evicts through the stall's on.release hook. Only under
    // INERT (the app/target owns release) does the card evict itself.
    if (terminal.stall?.$phase?.get?.() !== "inert") return;
    terminal.thread.daemon.entities.buffer.drop(buffer.id);
    terminal.thread.daemon.entities.buffer.removeOne({ id: buffer.id });
    if (terminal.buffer?.id === buffer.id) terminal.buffer = null;
  }
</script>

<div class="spawned">
  <div class="idx">#{$data?.index ?? 0}</div>
  <div class="label">{$data?.label ?? "spawned"}</div>
  <button class="done" onclick={complete}>✓ complete</button>
</div>

<style>
  .spawned {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
  }
  .idx {
    opacity: 0.35;
    font-size: var(--font-size-sm);
  }
  .label {
    font-size: var(--font-size-4xl);
  }
  .done {
    margin-top: 0.6rem;
    padding: 0.4rem 1.1rem;
    font-family: inherit;
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 0.3rem;
    cursor: pointer;
  }
  .done:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
</style>

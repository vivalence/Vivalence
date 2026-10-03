<script>
  import { Stepper } from "@vivalence/drapes";

  let { thread } = $props();

  const CELLS = [1, 2, 3, 4, 5, 6, 8, 10];

  let depth = $state(1);
  let saving = $state(false);

  $effect(() => {
    if (!thread) return;
    const off = thread.$trait.subscribe((value) => (depth = value?.QUEUEING?.depth ?? 1));
    return off;
  });

  async function setDepth(value) {
    if (!thread || saving) return;
    const next = Math.max(0, Math.min(10, Number(value) || 0));
    saving = true;
    try {
      const trait = { ...thread.trait, QUEUEING: { ...(thread.trait?.QUEUEING ?? {}), depth: next } };
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait });
      thread.trait = trait;
    } finally {
      saving = false;
    }
  }
</script>

<div class="queueing">
  <div class="queueing-line">
    <span class="queueing-name">depth</span>
    <div class="queueing-cells">
      {#each CELLS as cell (cell)}
        <button class="queueing-cell" class:full={depth >= cell} title="depth {cell}" aria-label="depth {cell}" onclick={() => setDepth(cell)}></button>
      {/each}
    </div>
    <Stepper value={depth} min={0} max={10} onchange={setDepth} />
  </div>
  <span class="queueing-note">the stall keeps this many buffers queued · under 1 the continuous phase is refused</span>
</div>

<style>
  .queueing {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .queueing-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
  }
  .queueing-name {
    flex: 0 0 52px;
    color: var(--text-light);
  }
  .queueing-cells {
    flex: 1 1 120px;
    min-width: 0;
    display: flex;
    gap: 3px;
  }
  .queueing-cell {
    flex: 1;
    min-width: 0;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: var(--shape-radius-xs);
    background: var(--control-contrast);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    cursor: pointer;
  }
  .queueing-cell.full {
    background: var(--signal-primary);
    box-shadow: none;
  }
  .queueing-note {
    color: var(--text-light);
    line-height: var(--size-leading-loose);
  }
  @media (pointer: coarse) {
    .queueing-cell {
      min-height: 44px;
    }
  }
</style>

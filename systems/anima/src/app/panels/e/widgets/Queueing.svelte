<script>
  let { thread } = $props();

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
  <span class="key">depth</span>
  <input
    type="range"
    min="0"
    max="10"
    value={depth}
    onchange={(event) => setDepth(event.currentTarget.value)}
    class="slider" />
  <span class="value">{depth}</span>
</div>

<style>
  .queueing {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
  }
  .key {
    min-width: 44px;
    opacity: 0.55;
    font-size: var(--font-size-2xs);
  }
  .slider {
    flex: 1;
  }
  .value {
    opacity: 0.6;
    font-size: var(--font-size-2xs);
    min-width: 14px;
    text-align: right;
  }
</style>

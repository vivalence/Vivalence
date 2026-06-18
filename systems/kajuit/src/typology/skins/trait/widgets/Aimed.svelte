<script>
  let { thread } = $props();

  let current = $state();
  let mode = $state(null);
  let traits = $state([]);
  let saving = $state(false);

  $effect(() => {
    if (!thread) return;
    const offTrait = thread.$trait.subscribe((value) => (current = value?.AIMED?.mount));
    const offMode = thread.$mode.subscribe((value) => (mode = value));
    const offTraits = thread.$traits.subscribe((value) => (traits = value ?? []));
    return () => {
      offTrait();
      offMode();
      offTraits();
    };
  });

  let mounts = $derived((mode?.emitter?.leaves ?? []).map((leaf) => `/emit/${leaf.nature}`));
  let active = $derived(traits.includes("AIMED"));

  async function pick(mount) {
    if (!thread || saving) return;
    saving = true;
    try {
      const next = { ...thread.trait, AIMED: { ...(thread.trait?.AIMED ?? {}), mount } };
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait: next });
      thread.trait = next;
    } finally {
      saving = false;
    }
  }
</script>

<div class="aimed" class:active>
  {#each mounts as mount (mount)}
    <button class="route" class:on={current === mount} onclick={() => pick(mount)} disabled={saving}>
      <span class="check">{current === mount ? "✓" : ""}</span>
      <span class="path">{mount}</span>
    </button>
  {:else}
    <span class="muted">mode has no emitter</span>
  {/each}
</div>

<style>
  .aimed {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 6px 8px;
  }
  .route {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    text-align: left;
    cursor: pointer;
    opacity: 0.55;
  }
  .route:hover {
    opacity: 0.9;
    background: color-mix(in srgb, var(--colors-skeleton-2-surface) 50%, transparent);
  }
  .route.on {
    opacity: 1;
    border-color: color-mix(in srgb, currentColor 35%, transparent);
    color: color-mix(in srgb, currentColor 50%, transparent);
  }
  .aimed.active .route.on {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .check {
    width: 10px;
    color: color-mix(in srgb, currentColor 50%, transparent);
  }
  .aimed.active .check {
    color: var(--colors-skeleton-0-primary-base);
  }
  .muted {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
  }
</style>

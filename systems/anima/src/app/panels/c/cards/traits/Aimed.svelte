<script>
  import { Row } from "@vivalence/drapes";

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

  let mounts = $derived(
    Object.keys(mode?.metadata?.emitter?.branches ?? {}).map((nature) => `/emit/${nature}`),
  );
  let active = $derived(traits.includes("AIMED"));

  async function pick(mount) {
    if (!thread || saving) return;
    saving = true;
    try {
      const next = { ...thread.trait, AIMED: { ...(thread.trait?.AIMED ?? {}), mount } };
      thread.trait = next;
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait: next });
    } finally {
      saving = false;
    }
  }
</script>

<div class="aimed">
  {#each mounts as mount (mount)}
    <Row selected={current === mount} title="aim the thread at this mount" onclick={() => pick(mount)}>
      <span class="aimed-check" class:lit={active}>{current === mount ? "✓" : ""}</span>
      <span class="aimed-path">{mount}</span>
      <span class="aimed-meta">{current === mount ? (active ? "mount" : "mount · aimed is off") : ""}</span>
    </Row>
  {:else}
    <span class="aimed-note">mode has no emitter</span>
  {/each}
  <span class="aimed-note">the mount is the emitter leaf a pull calls · masked merges into its input</span>
</div>

<style>
  .aimed {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .aimed-check {
    flex: none;
    width: 10px;
    color: var(--text-light);
  }
  .aimed-check.lit {
    color: var(--signal-primary-ink);
  }
  .aimed-path {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .aimed-meta {
    flex: none;
    color: var(--text-muted);
  }
  .aimed-note {
    padding-top: 4px;
    color: var(--text-light);
    line-height: var(--size-leading-loose);
  }
</style>

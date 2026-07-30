<script>
  import Row from "./Row.svelte";

  let { thread } = $props();

  let name = $state("");
  let description = $state("");
  let saving = $state(false);

  $effect(() => {
    const label = thread?.label ?? thread?.trait?.LABELED ?? {};
    name = label.name ?? "";
    description = label.description ?? "";
  });

  async function save() {
    if (!thread) return;
    saving = true;
    try {
      const next = { name, description };
      await thread.daemon.entities.thread.updateOne(
        { id: thread.id },
        { trait: { ...thread.trait, LABELED: next } },
      );
      thread.label = next;
    } finally {
      saving = false;
    }
  }
</script>

<Row letter="L" name="labeled · editor" status={saving ? "saving" : "live"} statusKind={saving ? "pulling" : "live"}>
  <div class="kv">
    <span class="k">name</span>
    <input class="text" bind:value={name} placeholder="—" />
  </div>
  <div class="kv">
    <span class="k">description</span>
    <input class="text" bind:value={description} placeholder="—" />
  </div>

  {#snippet footer()}
    <button class="btn" onclick={save} disabled={!thread || saving}>save</button>
  {/snippet}
</Row>

<style>
  .kv {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .k {
    min-width: 70px;
    opacity: 0.5;
  }
  .text {
    flex: 1;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    padding: 1px 4px;
  }
  .btn {
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.6;
  }
  .btn:hover:not(:disabled) {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
</style>

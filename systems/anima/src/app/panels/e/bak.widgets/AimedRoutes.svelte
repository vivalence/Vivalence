<script>
  import Row from "./Row.svelte";

  let { thread } = $props();

  let routes = $state([]);
  let saving = $state(false);

  $effect(() => {
    if (!thread?.daemon?.entities?.intent || !thread?.mode?.id) return;
    const intents = thread.daemon.entities.intent.$entities?.get?.() ?? [];
    const mounts = new Set();
    for (const intent of intents) {
      if (intent.mode?.id !== thread.mode.id && intent.mode !== thread.mode.id) continue;
      const mount = intent.trait?.AIMED?.mount;
      if (mount) mounts.add(mount);
    }
    routes = [...mounts].sort();
  });

  async function pick(mount) {
    if (!thread || saving) return;
    saving = true;
    try {
      await thread.daemon.entities.thread.updateOne(
        { id: thread.id },
        { trait: { ...thread.trait, AIMED: { ...(thread.trait?.AIMED ?? {}), mount } } },
      );
    } finally {
      saving = false;
    }
  }
</script>

<h1 class="">mount</h1>
<Row letter="A" name="aimed · routes" status={saving ? "saving" : "set"} statusKind={saving ? "pulling" : "idle"}>
  <div class="kv">
    <span class="k">mount</span>
    <div class="list">
      {#each routes as route}
        <button
          class="route"
          class:on={thread?.trait?.AIMED?.mount === route}
          onclick={() => pick(route)}
          disabled={saving}>
          <span class="check">{thread?.trait?.AIMED?.mount === route ? "✓" : ""}</span>
          <span class="path">{route}</span>
        </button>
      {/each}
      {#if !routes.length}
        <span class="muted">no intent routes for this mode</span>
      {/if}
    </div>
  </div>
</Row>

<style>
  .kv {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .k {
    min-width: 70px;
    opacity: 0.5;
    padding-top: 2px;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }
  .route {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 1px 4px;
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
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
  }
  .route.on {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .check {
    width: 10px;
    color: var(--colors-skeleton-0-primary-base);
  }
  .path {
    flex: 1;
  }
  .muted {
    opacity: 0.3;
    font-size: var(--font-size-2xs);
  }
</style>

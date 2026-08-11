<script>
  import { tiers } from "@vivalence/typology";

  let { thread } = $props();

  const TIERS = Object.keys(tiers);
  const EFFORTS = ["low", "medium", "high"];

  let tune = $state(undefined);
  let effort = $state(undefined);
  let saving = $state(false);

  $effect(() => {
    if (!thread) return;
    const off = thread.$trait.subscribe((value) => {
      tune = value?.INTELLIGENT?.tune;
      effort = value?.INTELLIGENT?.effort;
    });
    return off;
  });

  async function write(patch) {
    if (!thread || saving) return;
    saving = true;
    try {
      const current = { ...(thread.trait?.INTELLIGENT ?? {}), ...patch };
      for (const key of Object.keys(current)) if (current[key] === undefined) delete current[key];
      const trait = { ...thread.trait, INTELLIGENT: current };
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait });
      thread.trait = trait;
    } finally {
      saving = false;
    }
  }
</script>

<div class="intelligent">
  <div class="row">
    <span class="key">tune</span>
    <div class="options">
      {#each TIERS as tier (tier)}
        <span
          class="option"
          class:on={tune === tier}
          onclick={() => write({ tune: tune === tier ? undefined : tier })}>{tier}</span>
      {/each}
    </div>
  </div>
  <div class="row">
    <span class="key">effort</span>
    <div class="options">
      {#each EFFORTS as level (level)}
        <span
          class="option"
          class:on={effort === level}
          onclick={() => write({ effort: effort === level ? undefined : level })}>{level}</span>
      {/each}
    </div>
  </div>
</div>

<style>
  .intelligent {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
  }
  .row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .key {
    min-width: 44px;
    opacity: 0.55;
    font-size: var(--font-size-2xs);
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 8px;
  }
  .option {
    cursor: pointer;
    opacity: 0.45;
    font-size: var(--font-size-2xs);
  }
  .option:hover {
    opacity: 0.8;
  }
  .option.on {
    opacity: 1;
    color: var(--colors-skeleton-2-primary, inherit);
  }
</style>

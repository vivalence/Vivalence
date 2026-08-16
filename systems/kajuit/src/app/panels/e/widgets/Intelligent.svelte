<script>
  import { tiers, nearest } from "@vivalence/typology";

  let { thread } = $props();

  const TIERS = Object.keys(tiers);
  const EFFORTS = ["none", "low", "medium", "high"];
  const AXES = ["intelligence", "reasoning", "speed", "thrift"];

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

  const faculties = $derived.by(() => {
    const cortex = thread?.daemon?.cortex;
    if (!cortex) return [];
    const dialogue = cortex.find({ type: "dialogue" });
    return dialogue.length ? dialogue : cortex.find({});
  });

  const thinks = (faculty) =>
    (faculty?.channels?.out ?? []).includes("thinking") ||
    (faculty?.channels?.in ?? []).includes("thinking");

  const resolve = (target) => (faculties.length && target != null ? nearest(faculties, target) : null);
  const resolved = $derived(resolve(tune));

  const contextLabel = (context) =>
    context >= 1000 ? `${Math.round(context / 1000)}k context` : `${context ?? "?"} context`;
  const avenues = (faculty) => Object.keys(faculty?.via ?? {}).join(" + ");
  const thinking = (faculty) =>
    !thinks(faculty) ? "no thinking" : effort === "none" ? "thinking off" : "thinking";
  const summary = (faculty) =>
    faculty ? `${faculty.type} · ${contextLabel(faculty.context)} · ${thinks(faculty) ? "thinking" : "no thinking"}` : "";

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
    <div class="chips">
      {#each TIERS as tier (tier)}
        <button
          class="chip"
          class:on={tune === tier}
          title={summary(resolve(tier))}
          onclick={() => write({ tune: tune === tier ? undefined : tier })}>{tier}</button>
      {/each}
      {#if Array.isArray(tune)}<span class="chip on">custom</span>{/if}
    </div>
  </div>
  <div class="row">
    <span class="key">effort</span>
    <div class="chips">
      {#each EFFORTS as level (level)}
        <button
          class="chip"
          class:on={effort === level}
          title={level === "none" ? "no thinking — the model answers directly" : `${level} reasoning effort`}
          onclick={() => write({ effort: effort === level ? undefined : level })}
          >{level === "none" ? "no thinking" : level}</button>
      {/each}
    </div>
  </div>
  {#if resolved}
    <div class="resolved">
      <span class="type">{resolved.type}</span>
      <span class="fact">{contextLabel(resolved.context)}</span>
      <span class="fact" class:lit={thinking(resolved) === "thinking"}>{thinking(resolved)}</span>
      <span class="fact">{avenues(resolved)}</span>
    </div>
    <div class="axes">
      {#each AXES as axis, index (axis)}
        <span class="axis" title="{axis} {(resolved.tune?.[index] ?? 0).toFixed(1)}">
          <span class="axis-name">{axis}</span>
          <span class="axis-bar"><span class="axis-fill" style:width="{(resolved.tune?.[index] ?? 0) * 100}%"></span></span>
        </span>
      {/each}
    </div>
  {:else}
    <div class="resolved dim">the mode decides</div>
  {/if}
</div>

<style>
  .intelligent {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 8px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .key {
    min-width: 44px;
    opacity: 0.55;
    font-size: var(--font-size-2xs);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .chip {
    height: 18px;
    padding: 0 7px;
    line-height: 1;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.16s, color 0.16s, border-color 0.16s;
  }
  .chip:hover {
    opacity: 0.9;
    color: var(--colors-skeleton-0-primary-base);
  }
  .chip.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .resolved {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    padding-left: 52px;
  }
  .resolved.dim {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
    font-style: italic;
  }
  .type {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-0-primary-base);
  }
  .fact {
    font-size: var(--font-size-2xs);
    opacity: 0.55;
  }
  .fact.lit {
    opacity: 0.95;
    color: var(--colors-skeleton-0-primary-base);
  }
  .axes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    padding-left: 52px;
  }
  .axis {
    display: grid;
    grid-template-columns: 68px 1fr;
    align-items: center;
    gap: 6px;
  }
  .axis-name {
    font-size: var(--font-size-2xs);
    opacity: 0.45;
  }
  .axis-bar {
    height: 3px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 55%, transparent);
    overflow: hidden;
    display: block;
  }
  .axis-fill {
    display: block;
    height: 100%;
    background: var(--colors-skeleton-0-primary-base);
    opacity: 0.7;
  }
</style>

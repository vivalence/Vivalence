<script>
  import { tiers, nearest } from "@vivalence/typology";

  let { thread } = $props();

  const TIERS = Object.keys(tiers);
  const EFFORTS = ["none", "low", "medium", "high"];
  const ROUNDS = [1, 2, 5, 10, 25];
  const AXES = ["intelligence", "reasoning", "speed", "thrift"];

  let tune = $state(undefined);
  let effort = $state(undefined);
  let thinking = $state(undefined);
  let rounds = $state(undefined);
  let saving = $state(false);

  $effect(() => {
    if (!thread) return;
    const off = thread.$trait.subscribe((value) => {
      tune = value?.INTELLIGENT?.tune;
      effort = value?.INTELLIGENT?.effort;
      thinking = value?.INTELLIGENT?.thinking;
      rounds = value?.INTELLIGENT?.rounds;
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
    context >= 1_000_000
      ? `${Math.round(context / 1_048_576)}m context`
      : context >= 1000
        ? `${Math.round(context / 1000)}k context`
        : `${context ?? "?"} context`;
  const avenues = (faculty) => Object.keys(faculty?.via ?? {}).join(" + ");
  const thinkingLabel = (faculty) =>
    !thinks(faculty) ? "no thinking" : effort === "none" ? "thinking off" : "thinking";
  const origin = (faculty) => [faculty?.provider, faculty?.config?.model].filter(Boolean).join(" · ");
  const summary = (faculty) =>
    faculty
      ? [faculty.type, origin(faculty), contextLabel(faculty.context), thinks(faculty) ? "thinking" : "no thinking"]
          .filter(Boolean)
          .join(" · ")
      : "";

  async function write(patch) {
    if (!thread || saving) return;
    saving = true;
    try {
      const current = { ...(thread.trait?.INTELLIGENT ?? {}), ...patch };
      for (const key of Object.keys(current)) if (current[key] === undefined) delete current[key];
      const trait = { ...thread.trait, INTELLIGENT: current };
      const claim = thread.traits.includes("INTELLIGENT") ? {} : { traits: [...thread.traits, "INTELLIGENT"] };
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { trait, ...claim });
      thread.trait = trait;
      if (claim.traits) thread.traits = claim.traits;
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
    <div class="chips" class:inert={resolved && !thinks(resolved)} title={resolved && !thinks(resolved) ? "resolved faculty doesn't think — effort has no effect here" : undefined}>
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
  <div class="row">
    <span class="key">rounds</span>
    <div class="chips">
      {#each ROUNDS as count (count)}
        <button
          class="chip"
          class:on={rounds === count}
          title={count === 1
            ? "one round — the model answers directly, no tool loop"
            : `up to ${count} model rounds per turn — each round may call tools`}
          onclick={() => write({ rounds: rounds === count ? undefined : count })}>{count}</button>
      {/each}
      {#if rounds !== undefined && !ROUNDS.includes(rounds)}<span class="chip on">{rounds}</span>{/if}
    </div>
  </div>
  <div class="row">
    <span class="key">thinking</span>
    <div class="chips">
      <button
        class="chip"
        class:on={thinking === true}
        title="render the thinking process inline on every turn"
        onclick={() => write({ thinking: thinking === true ? undefined : true })}>shown</button>
      <button
        class="chip"
        class:on={thinking === false}
        title="never show the thinking process"
        onclick={() => write({ thinking: thinking === false ? undefined : false })}>hidden</button>
    </div>
  </div>
  {#if resolved}
    <div class="resolved">
      <span class="type">{resolved.type}</span>
      {#if origin(resolved)}<span class="origin">{origin(resolved)}</span>{/if}
      <span class="fact">{contextLabel(resolved.context)}</span>
      <span class="fact" class:lit={thinkingLabel(resolved) === "thinking"}>{thinkingLabel(resolved)}</span>
      <span class="fact">{avenues(resolved)}</span>
    </div>
    <div class="axes">
      {#each AXES as axis, index (axis)}
        {@const value = resolved.tune?.[index] ?? 0}
        <span class="axis" title="{axis} {value.toFixed(1)}">
          <span class="axis-name">{axis}</span>
          <span class="cells">
            {#each { length: 5 } as _, cell (cell)}
              <span class="cell" class:full={value * 5 >= cell + 0.5}></span>
            {/each}
          </span>
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
    align-items: flex-start;
    gap: 8px;
  }
  .key {
    min-width: 44px;
    line-height: 18px;
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
  @media (hover: hover) {
    .chip:hover {
      opacity: 0.9;
      color: var(--colors-skeleton-0-primary-base);
    }
  }
  .chip.on {
    opacity: 1;
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-surface);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .chips.inert {
    opacity: 0.35;
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
  .origin {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    opacity: 0.75;
    overflow-wrap: anywhere;
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
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    padding-left: 52px;
  }
  .axis {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .axis-name {
    font-size: var(--font-size-2xs);
    opacity: 0.45;
  }
  .cells {
    display: inline-flex;
    gap: 2px;
  }
  .cell {
    width: 7px;
    height: 7px;
    border-radius: 1px;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 55%, transparent);
  }
  .cell.full {
    background: var(--colors-skeleton-0-primary-base);
    opacity: 0.8;
  }
</style>

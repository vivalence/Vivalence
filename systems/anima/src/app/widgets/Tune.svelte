<script>
  import { nearest } from "@vivalence/typology";
  import { Key, Segmented, Stepper, Tag } from "@vivalence/drapes";
  import { AXES, EFFORTS, TIERS, avenues, contextLabel, faculties, origin, summary, thinks, write } from "../panels/e/widgets/intelligent.js";

  let { thread } = $props();

  let held = $state({});
  let saving = $state(false);

  $effect(() => {
    if (!thread) return void (held = {});
    return thread.$trait.subscribe((value) => (held = value?.INTELLIGENT ?? {}));
  });

  const pool = $derived(faculties(thread));
  const resolve = (target) => (pool.length && target != null ? nearest(pool, target) : null);
  const resolved = $derived(resolve(held.tune));
  const inert = $derived(Boolean(resolved) && !thinks(resolved));

  const tunes = $derived(TIERS.map((tier) => ({ value: tier, label: tier, title: summary(resolve(tier)) })));
  const efforts = EFFORTS.map((level) => ({
    value: level,
    label: level === "none" ? "no thinking" : level,
    title: level === "none" ? "no thinking — the model answers directly" : `${level} reasoning effort`,
  }));
  const showings = [
    { value: true, label: "shown", title: "render the thinking process inline on every turn" },
    { value: false, label: "hidden", title: "never show the thinking process" },
  ];

  async function put(patch) {
    if (!thread || saving) return;
    saving = true;
    try {
      await write(thread, patch);
    } finally {
      saving = false;
    }
  }

  const pick = (key) => (value) => put({ [key]: held[key] === value ? undefined : value });
</script>

<div class="tune">
  {#if resolved}
    <div class="faculty">
      <span class="faculty-type">{resolved.type}</span>
      {#if origin(resolved)}<span class="faculty-origin">{origin(resolved)}</span>{/if}
      <span class="faculty-fact">{contextLabel(resolved.context)}</span>
      <span class="faculty-fact" class:lit={thinks(resolved) && held.effort !== "none"}>
        {!thinks(resolved) ? "no thinking" : held.effort === "none" ? "thinking off" : "thinking"}
      </span>
      {#if avenues(resolved)}<span class="faculty-fact">{avenues(resolved)}</span>{/if}
    </div>
    <div class="axes">
      {#each AXES as axis, index (axis)}
        {@const value = resolved.tune?.[index] ?? 0}
        <span class="axis" title="{axis} {value.toFixed(1)}">
          <span class="axis-name">{axis}</span>
          <span class="axis-cells">
            {#each { length: 5 } as _, cell (cell)}
              <span class="axis-cell" class:full={value * 5 >= cell + 0.5}></span>
            {/each}
          </span>
        </span>
      {/each}
    </div>
  {:else}
    <div class="faculty undecided">the mode decides</div>
  {/if}

  <div class="knob">
    <span class="knob-name">tune {#if Array.isArray(held.tune)}<Tag tone="primary">custom</Tag>{/if}</span>
    <Segmented options={tunes} value={held.tune} cell={96} onpick={pick("tune")} />
  </div>
  <div class="knob" class:inert title={inert ? "resolved faculty doesn't think — effort has no effect here" : null}>
    <span class="knob-name">effort</span>
    <Segmented options={efforts} value={held.effort} cell={96} onpick={pick("effort")} />
  </div>
  <div class="knob">
    <span class="knob-name">rounds</span>
    <div class="knob-line">
      <Stepper value={held.rounds ?? 1} min={1} max={25} onchange={(rounds) => put({ rounds })} />
      {#if held.rounds !== undefined}
        <Key size="mini" tone="ghost" label="the mode decides" onclick={() => put({ rounds: undefined })} />
      {/if}
    </div>
  </div>
  <div class="knob">
    <span class="knob-name">thinking</span>
    <Segmented options={showings} value={held.thinking} onpick={pick("thinking")} />
  </div>
</div>

<style>
  .tune {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .faculty {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .faculty.undecided {
    color: var(--text-light);
    font-style: italic;
  }
  .faculty-type {
    color: var(--signal-primary-ink);
  }
  .faculty-origin {
    color: var(--text-ink);
    overflow-wrap: anywhere;
  }
  .faculty-fact {
    color: var(--text-light);
  }
  .faculty-fact.lit {
    color: var(--signal-primary-ink);
  }
  .axes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
  }
  .axis {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .axis-name {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .axis-cells {
    display: inline-flex;
    gap: 2px;
  }
  .axis-cell {
    width: 7px;
    height: 7px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .axis-cell.full {
    background: var(--signal-primary);
  }
  .knob {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .knob.inert {
    color: var(--text-muted);
  }
  .knob-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .knob-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>

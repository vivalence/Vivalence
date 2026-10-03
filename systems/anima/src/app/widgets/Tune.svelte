<script>
  import { nearest } from "@vivalence/typology";
  import { Key, Segmented, Stepper, Tag } from "@vivalence/drapes";
  import { EFFORTS, TIERS, faculties, summary, thinks, write } from "./intelligent.js";
  import Faculty from "./Faculty.svelte";

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
  <Faculty {resolved} effort={held.effort} />

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

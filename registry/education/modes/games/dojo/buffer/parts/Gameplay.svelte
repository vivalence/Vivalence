<script>
  import * as types from "../../types.js";
  import Segment from "./Segment.svelte";
  import Stepper from "./Stepper.svelte";

  const {
    axes,
    material = [],
    labels = {},
    locked = false,
    startable = false,
    startLabel = "add something first",
    committing = false,
    showStart = true,
    playing = false,
    onstart,
    onstop,
    onpreset,
    onaxes,
  } = $props();

  const PROMPTS = ["TEXT", "AUDIO"];
  const RATES = ["FAST", "NORMAL", "SLOW"];
  const MINUTE = 60;

  const same = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
  const pool = (axis, all) => (Array.isArray(axis) ? axis : axis ? [axis] : all);
  const lit = (axis, all, value) => pool(axis, all).includes(value);

  const toggled = (axis, all, value) => {
    const current = pool(axis, all);
    const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...all.filter((entry) => current.includes(entry) || entry === value)];
    if (!next.length || next.length === all.length) return [...all];
    return next.length === 1 ? next[0] : next;
  };

  const rate = $derived(axes.preview?.speed?.rate ?? (axes.preview ? "NORMAL" : null));
  const seconds = $derived(axes.limit?.seconds ?? 0);
  const reps = $derived(axes.limit?.reps ?? 0);
  const minutes = $derived(Math.round(seconds / MINUTE));

  const scoped = (where) =>
    !where?.ontology || (material.length > 0 && material.every((ontology) => [].concat(where.ontology).includes(ontology)));
  const constraints = (name) => [...Object.keys(types.PRESETS[name].axes), ...(types.PRESETS[name].where ? ["where"] : [])];
  const satisfied = $derived(
    Object.keys(types.PRESETS).filter(
      (name) =>
        Object.entries(types.PRESETS[name].axes).every(([key, value]) => same(axes[key], value)) &&
        scoped(types.PRESETS[name].where),
    ),
  );
  const presetOn = (name) =>
    satisfied.includes(name) &&
    !satisfied.some(
      (other) =>
        other !== name &&
        constraints(other).length > constraints(name).length &&
        constraints(name).every((key) => constraints(other).includes(key)),
    );

  const frozen = (key) => locked && !types.LIVE.includes(key);

  const limitPatch = (nextReps, nextSeconds) => ({
    limit: nextReps || nextSeconds ? { ...(nextReps ? { reps: nextReps } : {}), ...(nextSeconds ? { seconds: nextSeconds } : {}) } : undefined,
  });

  const rows = $derived([
    {
      key: "gameplay",
      all: types.GAMEPLAYS,
      note: pool(axes.gameplay, types.GAMEPLAYS).length > 1 ? "drawn per rep — CONJUGATE only for conjugation rows" : "type it · pick it · flip it · conjugate the table",
      segments: types.GAMEPLAYS.map((value) => ({ label: value, on: lit(axes.gameplay, types.GAMEPLAYS, value), patch: { gameplay: toggled(axes.gameplay, types.GAMEPLAYS, value) } })),
    },
    {
      key: "streak",
      note: axes.streak ? `${axes.streak} in a row per subject${axes.anhieb ? ` · first-try lands ${1 + axes.anhieb}` : ""}` : "single pass",
    },
    {
      key: "limit",
      note: reps || seconds ? "hard cutoff, even mid-streak" : "run to completion",
    },
    {
      key: "continuous",
      note: axes.continuous ? "re-resolve on completion" : "one pass, then the standby",
      segments: [
        {
          label: "on",
          on: Boolean(axes.continuous),
          patch: { continuous: axes.continuous ? undefined : true },
        },
      ],
    },
    {
      key: "prompt",
      all: PROMPTS,
      note: axes.greedy ? "AUDIO wherever it resolves — tables excepted" : pool(axes.prompt, PROMPTS).length > 1 ? "drawn per rep — AUDIO only where it resolves" : "AUDIO keeps only VOCALIZED",
      segments: [
        ...PROMPTS.map((value) => ({ label: value, on: lit(axes.prompt, PROMPTS, value), patch: { prompt: toggled(axes.prompt, PROMPTS, value) } })),
        ...(lit(axes.prompt, PROMPTS, "AUDIO")
          ? [{ label: "greedy", on: Boolean(axes.greedy), patch: { greedy: axes.greedy ? undefined : true } }]
          : []),
      ],
    },
    {
      key: "recall",
      all: types.RECALLS,
      note:
        axes.recall === "LEARNING"
          ? `you produce ${labels.learning ?? "the learning side"}`
          : axes.recall === "KNOWN"
            ? `you produce ${labels.known ?? "the known side"}`
            : "drawn per rep",
      segments: types.RECALLS.map((value) => ({ label: value, on: lit(axes.recall, types.RECALLS, value), patch: { recall: toggled(axes.recall, types.RECALLS, value) } })),
    },
    {
      key: "preview",
      note: rate ? "memorize while it shows, then type" : "straight to recall",
      segments: RATES.map((value) => ({
        label: value.toLowerCase(),
        on: rate === value,
        patch:
          rate === value
            ? { preview: undefined }
            : { preview: { ...axes.preview, speed: { ...(axes.preview?.speed ?? {}), rate: value } } },
      })),
    },
    ...(rate && (axes.preview?.when ?? "ONCE") === "STATUS"
      ? [
          {
            key: "preview status",
            axis: "preview",
            note: "shown while the literal sits in one of these",
            segments: types.STATUSES.map((value) => ({
              label: value.toLowerCase(),
              on: (axes.preview?.status ?? ["UNTOUCHED", "UNKNOWN"]).includes(value),
              patch: {
                preview: {
                  ...axes.preview,
                  status: (() => {
                    const current = axes.preview?.status ?? ["UNTOUCHED", "UNKNOWN"];
                    const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...types.STATUSES.filter((entry) => current.includes(entry) || entry === value)];
                    return next.length ? next : current;
                  })(),
                },
              },
            })),
          },
        ]
      : []),
    ...(rate
      ? [
          {
            key: "preview when",
            axis: "preview",
            note: { ONCE: "first rep of each knowable", ALWAYS: "every rep, requeues included", MISSED: "only while its last signal is a miss", STATUS: "only while its retention sits in a chosen status" }[axes.preview?.when ?? "ONCE"],
            segments: types.PREVIEW_WHENS.map((value) => ({
              label: value.toLowerCase(),
              on: (axes.preview?.when ?? "ONCE") === value,
              patch: { preview: { ...axes.preview, when: value } },
            })),
          },
        ]
      : []),
    {
      key: "randomness",
      axis: "random",
      note: [
        types.shuffling(axes.random) ? "queue shuffled" : "course order",
        types.drawing(axes.random) ? "recall, game and prompt drawn per subject · a miss keeps its setup, a landing wears a new one" : "pools cycle in their own order",
      ].join(" · "),
      segments: types.RANDOMS.map((value) => ({
        label: value.toLowerCase(),
        on: types.randomness(axes.random).includes(value),
        patch: {
          random: types.RANDOMS.filter((entry) =>
            entry === value ? !types.randomness(axes.random).includes(value) : types.randomness(axes.random).includes(entry),
          ),
        },
      })),
    },
    {
      key: "forgiving",
      note: "fold diacritics + case",
      segments: [
        { label: "true", on: axes.forgiving !== false, patch: { forgiving: true } },
        { label: "false", on: axes.forgiving === false, patch: { forgiving: false } },
      ],
    },
  ]);

  const summary = $derived(
    [
      pool(axes.gameplay, types.GAMEPLAYS).join("/"),
      axes.streak ? `×${axes.streak}` : null,
      pool(axes.prompt, PROMPTS).includes("AUDIO") ? (axes.greedy ? "audio·greedy" : "audio") : null,
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

<div class="gameplay">
  {#if showStart}
    <div class="start-row">
      <button class="start" class:ready={startable} disabled={!startable || committing} onclick={onstart}>
        {committing ? "materializing…" : playing ? "restart · " + startLabel.replace(/^start · /, "") : startLabel}
      </button>
      {#if playing}
        <button class="stop" title="end the session — the set and axes stay" onclick={onstop}>end</button>
      {/if}
    </div>
  {/if}
  <div class="scroll">
    <section class="block">
      <span class="title">gameplay presets</span>
      <div class="chips">
        {#each Object.entries(types.PRESETS) as [name, entry] (name)}
          <Segment label={name} on={presetOn(name)} title={entry.note} onclick={() => onpreset(name)} />
        {/each}
      </div>
    </section>
    <section class="block">
      <div class="axes-head">
        <span class="title">axes</span>
        <span class="summary">{summary}</span>
      </div>
      <div class="axes">
        {#each rows as axis (axis.key)}
          {@const cold = frozen(axis.axis ?? axis.key)}
          <div class="axis" class:frozen={cold}>
            <div class="axis-head">
              <span class="key">{axis.key}</span>
              <span class="note">{cold ? "locked while playing" : axis.note}</span>
            </div>
            <div class="chips">
              {#if axis.key === "streak"}
                <Stepper value={axes.streak ?? 0} min={0} max={20} lit={Boolean(axes.streak)} title="consecutive successes per subject — 0 = single pass (shift ±10)" onchange={(next) => (cold ? null : onaxes({ streak: next || undefined }))} />
                <span class="unit">in a row</span>
                {#if axes.streak}
                  <Stepper value={axes.anhieb ?? 0} min={0} max={axes.streak} lit={Boolean(axes.anhieb)} title="extra runs credited when it lands on the first rep (shift ±10)" onchange={(next) => (cold ? null : onaxes({ anhieb: next || undefined }))} />
                  <span class="unit">anhieb</span>
                {/if}
              {:else if axis.key === "limit"}
                <Stepper value={reps} min={0} max={999} title="max attempts — 0 = no cap (shift ±10)" onchange={(next) => onaxes(limitPatch(next, seconds))} />
                <span class="unit">reps</span>
                <Stepper value={minutes} min={0} max={240} title="max minutes — 0 = no cap (shift ±10)" onchange={(next) => onaxes(limitPatch(reps, next * MINUTE))} />
                <span class="unit">min</span>
              {:else}
                {#each axis.segments as segment (segment.label)}
                  <Segment label={segment.label} on={segment.on} dim={cold} onclick={() => (cold ? null : onaxes(segment.patch))} />
                {/each}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .gameplay {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    background: var(--colors-skeleton-1-surface);
  }
  .start-row {
    flex: none;
    display: flex;
    gap: 0.4rem;
    padding: 0.75rem 0.75rem 0.6rem;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
  }
  .stop {
    flex: none;
    padding: 0 0.8rem;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-system-error-contrast);
    background: transparent;
    color: var(--colors-system-error-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
  }
  .start {
    flex: 1;
    min-width: 0;
    padding: 0.75rem 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .start.ready {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .start:disabled {
    cursor: default;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .block {
    padding: 0.7rem 0.75rem 0;
  }
  .block:last-child {
    padding-bottom: 0.75rem;
  }
  .unit {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    align-self: center;
    margin-right: 0.35rem;
  }
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-support);
    opacity: 0.8;
  }
  .chips {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 0.35rem;
  }
  .axes-head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
  .summary {
    margin-left: auto;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .axes {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }
  .axis.frozen {
    opacity: 0.6;
  }
  .axis-head {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-width: 0;
  }
  .key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-primary);
    white-space: nowrap;
  }
  .note {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

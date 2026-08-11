<script>
  import { Asset, Pip } from "@vivalence/drapes";

  const {
    knowable,
    axes,
    recall,
    phase,
    method,
    status,
    asset = null,
    labels,
    position,
    total,
    elapsed = 0,
    span = 0,
    speed = null,
    hinted = false,
    onhint,
    onchrome,
  } = $props();

  const TASK = {
    TYPE: (label) => `write in ${label}`,
    PICK: () => "choose the match",
    FLIP: () => "recall it, then grade yourself",
  };
  const WAVE = 28;
  const URGENT = 0.8;

  const word = $derived(knowable.ontology === "word");
  const listening = $derived(axes.prompt === "AUDIO");

  const shown = $derived(recall === "KNOWN" ? knowable.learning : knowable.known);
  const answer = $derived(recall === "KNOWN" ? knowable.known : knowable.learning);
  const answerLabel = $derived(recall === "KNOWN" ? labels.known : labels.learning);
  const task = $derived(
    (listening ? "listen · " : "") + (TASK[axes.gameplay] ?? TASK.TYPE)(answerLabel ?? ""),
  );
  const example = $derived(
    knowable.example && (recall === "KNOWN" ? knowable.example.learning : knowable.example.known),
  );

  const context = $derived(
    Object.entries(knowable.context ?? {}).map(([key, value]) => ({ key, value })),
  );

  const pips = $derived(
    axes.streak ? Array.from({ length: axes.streak }, (value, index) => index < status.runs) : [],
  );

  const bits = $derived(
    [
      axes.limit?.reps && {
        label: `${Math.max(0, axes.limit.reps - status.reps)} reps left`,
        urgent: status.reps / axes.limit.reps > URGENT,
      },
      axes.limit?.seconds && {
        label: `${status.seconds}s left`,
        urgent: 1 - status.seconds / axes.limit.seconds > URGENT,
      },
    ].filter(Boolean),
  );

  const wave = $derived(
    Array.from(
      { length: WAVE },
      (value, index) => 6 + Math.abs(Math.sin((index + shown.length) * 1.1)) * 32,
    ),
  );

  const progress = $derived(span ? Math.min(1, elapsed / span) : 0);
</script>

<div class="meta">
  <span class="task">{task}</span>
  <span class="fact">{knowable.ontology}</span>
  <span class="fact">recall <span class="value">{recall}</span></span>
  <span class="fact">judge <span class="value">{method}</span></span>
  {#if total > 1}<span class="fact">{position}/{total}</span>{/if}
  {#if axes.continuous}<span class="fact accent">continuous · set {status.set}</span>{/if}

  <div class="aside">
    {#if pips.length}
      <div class="pips" title="{status.runs} of {axes.streak} consecutive">
        {#each pips as filled, index (index)}
          <Pip size={7} tone={filled ? "primary" : "muted"} />
        {/each}
      </div>
    {/if}
    {#each bits as bit (bit.label)}
      <span class="fact" class:urgent={bit.urgent}>{bit.label}</span>
    {/each}
    <button class="knob" class:open={hinted} onclick={onhint} title="hint (h)">?</button>
    {#if onchrome}
      <button class="knob" onclick={onchrome} title="chrome (\)">◨</button>
    {/if}
  </div>
</div>

{#if phase === "preview"}
  <span class="kicker">memorize · first rep</span>
  <p class="prompt" class:word>{answer}</p>
  <p class="translation">{shown}</p>
  <div class="progress"><div class="progress-fill" style:width="{progress * 100}%"></div></div>
  <span class="fact">
    {span}ms · base + {answer.length} chars × {speed?.multiplier ?? 0}ms
  </span>
{:else}
  {#if context.length}
    <div class="context">
      {#each context as pair (pair.key)}
        <div class="pair">
          <span class="pair-key">{pair.key}</span>
          <span class="pair-value">{pair.value}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if listening}
    <div class="audio">
      {#if asset}
        <Asset {asset} variant="inline" autoplay={true} />
        <div class="wave">
          {#each wave as height, index (index)}
            <div class="bar" style:height="{height}px"></div>
          {/each}
        </div>
      {:else}
        <p class="translation">no audio available</p>
      {/if}
    </div>
  {:else}
    <div class="line">
      <p class="prompt" class:word>{shown}</p>
      {#if asset}<Asset {asset} variant="dot" />{/if}
    </div>
  {/if}

  {#if hinted}
    <div class="hint-body">
      <p class="hint-text">{shown}</p>
      {#if example}<p class="hint-example">{example}</p>{/if}
    </div>
  {:else if word && example}
    <p class="example">{example}</p>
  {/if}
{/if}

<style>
  .meta {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
  }
  .task {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
    white-space: nowrap;
  }
  .fact {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
    white-space: nowrap;
  }
  .value {
    color: var(--text-primary);
  }
  .accent {
    color: var(--colors-theme-accent-contrast);
  }
  .urgent {
    color: var(--colors-system-error-contrast);
  }
  .aside {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .pips {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-support);
  }
  .knob {
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 0.25rem;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 60%, transparent);
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    line-height: 1;
    cursor: pointer;
  }
  .knob:hover,
  .knob.open {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }

  .kicker {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-system-warning-contrast);
  }
  .progress {
    height: 2px;
    background: var(--colors-skeleton-1-boundary);
    overflow: hidden;
    margin: 1.5rem 0 0.5rem 0;
  }
  .progress-fill {
    height: 100%;
    background: var(--colors-system-warning-contrast);
    transition: width 50ms linear;
  }

  .context {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .pair {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .pair-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
  .pair-value {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: var(--text-body);
  }

  .audio {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .wave {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 42px;
  }
  .bar {
    width: 3px;
    border-radius: 2px;
    background: var(--colors-skeleton-1-boundary);
  }

  .line {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .prompt {
    flex: 1;
    min-width: 0;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-3xl);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.15;
    margin: 0 0 0.5rem 0;
  }
  .prompt.word {
    font-size: var(--font-size-4xl);
  }
  .translation {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-base);
    color: var(--text-body);
    margin: 0;
  }

  .hint-body {
    margin-top: 0.75rem;
  }
  .hint-text {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    font-style: italic;
    color: var(--colors-theme-secondary-contrast);
    margin: 0;
  }
  .hint-example {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    font-style: italic;
    color: var(--text-support);
    margin: 0.125rem 0 0 0;
  }
  .example {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--text-support);
    font-style: italic;
    margin: 0.5rem 0 0 0;
  }

  @media (max-width: 640px) {
    .meta {
      gap: 0.625rem;
      margin-bottom: 1rem;
    }
    .prompt {
      font-size: var(--font-size-xl);
    }
    .prompt.word {
      font-size: var(--font-size-2xl);
    }
  }
</style>

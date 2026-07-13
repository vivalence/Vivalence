<script>
  import { Asset, Desk } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const recall = data.recall ?? "LEARNING";
  const gameplay = data.gameplay ?? "visual";
  const speed = data.speed ?? {};
  const literals = buffer.literals ?? [];

  const target = literals.find((l) => l.id === data.target);
  const distractor = data.distractor ? literals.find((l) => l.id === data.distractor) : null;
  const isCorrect = !data.distractor;

  const field = recall === "LEARNING" ? "known" : "learning";
  const sourceField = recall === "LEARNING" ? "learning" : "known";

  const isWord = target?.symbol?.word;
  const asset =
    (gameplay === "audio" || gameplay === "audio-only")
      ? terminal.daemon.getAsset(target?.trait?.VOCALIZED?.asset)
      : null;

  const sourceText = target && gameplay !== "audio-only"
    ? target.trait?.TRANSLATED?.[sourceField]
    : null;

  const shownText = distractor
    ? distractor.trait?.TRANSLATED?.[field]
    : target?.trait?.TRANSLATED?.[field];

  const correctText = target?.trait?.TRANSLATED?.[field];

  const SPEED_PRESETS = {
    FAST: { base: 1500, multiplier: 80 },
    NORMAL: { base: 2500, multiplier: 120 },
    SLOW: { base: 3500, multiplier: 180 },
  };

  const resolvedSpeed = (() => {
    const preset = SPEED_PRESETS[speed.rate] ?? SPEED_PRESETS.NORMAL;
    return {
      base: speed.base ?? preset.base,
      multiplier: speed.multiplier ?? preset.multiplier,
    };
  })();

  function computeTime(text) {
    if (!text) return resolvedSpeed.base;
    return resolvedSpeed.base + text.length * resolvedSpeed.multiplier;
  }

  let timer = $state(null);
  let elapsed = $state(0);
  let timeMs = $state(computeTime(shownText));
  let judged = $state(false);
  let result = $state(null);
  let swiping = $state(null);
  let swipeX = $state(0);
  let touchStartX = $state(0);

  const progress = $derived(timeMs > 0 ? elapsed / timeMs : 0);
  const urgent = $derived(progress >= 0.7);

  function startTimer() {
    const start = Date.now();
    timer = setInterval(() => {
      elapsed = Date.now() - start;
      if (elapsed >= timeMs) {
        clearInterval(timer);
        judge(null);
      }
    }, 50);
  }

  function judge(userSaysCorrect) {
    if (judged) return;
    judged = true;
    if (timer) clearInterval(timer);

    const isTimeout = userSaysCorrect === null;
    const correct = !isTimeout && userSaysCorrect === isCorrect;

    result = { correct, timeout: isTimeout };

    setTimeout(() => {
      terminal.daemon.connection.call("/review/literal", {
        signal: correct ? "SUCCESS" : "MISTAKE",
        scope: { literal: target.id },
      });
      buffer.release();
    }, correct ? 800 : 1500);
  }

  function handleKey(event) {
    if (judged) return;
    if (event.key === "ArrowLeft" || event.key === "1") {
      event.preventDefault();
      judge(false);
    }
    if (event.key === "ArrowRight" || event.key === "2") {
      event.preventDefault();
      judge(true);
    }
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    swiping = true;
    swipeX = 0;
  }

  function handleTouchMove(e) {
    if (!swiping) return;
    swipeX = e.touches[0].clientX - touchStartX;
  }

  function handleTouchEnd() {
    if (!swiping) return;
    swiping = false;
    if (Math.abs(swipeX) > 50 && !judged) {
      judge(swipeX > 0);
    }
    swipeX = 0;
  }

  if (target) startTimer();
</script>

<svelte:window onkeydown={handleKey} />

<Desk>
  {#snippet surface()}
    <div
      class="touch-layer"
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
    >
      <div class="timer-bar">
        <div class="timer-fill" class:timer-urgent={urgent} style="width: {Math.max(0, 1 - progress) * 100}%"></div>
      </div>
      <div class="stage-inner" style="transform: translateX({swipeX * 0.3}px)">
        {#if target}
          <div class="meta">
            {#if isWord}
              <span class="meta-type">word</span>
            {:else}
              <span class="meta-type">sentence</span>
            {/if}
          </div>

          {#if sourceText || asset}
            <div class="source-row">
              {#if sourceText}
                <p class="source" class:source-word={isWord}>{sourceText}</p>
              {/if}
              {#if asset}
                <div class="audio-block"><Asset autoplay={true} {asset} /></div>
              {/if}
            </div>
          {/if}

          <div class="shown-row">
            <p class="shown" class:shown-word={isWord}>
              {shownText}
            </p>
          </div>

          {#if result}
            <div class="feedback">
              <div class="fb-line" class:fb-ok={result.correct} class:fb-miss={!result.correct}>
                <span class="fb-icon">{result.correct ? "✓" : "✗"}</span>
                <span class="fb-text">
                  {#if result.timeout}
                    time ran out
                  {:else if result.correct && isCorrect}
                    that was right
                  {:else if result.correct && !isCorrect}
                    that was wrong
                  {:else if !result.correct && isCorrect}
                    that was right
                  {:else}
                    that was actually correct
                  {/if}
                </span>
              </div>
              {#if !isCorrect && correctText}
                <div class="fb-answer">
                  <span class="fb-answer-label">correct</span>
                  <span class="fb-answer-text">{correctText}</span>
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    {#if judged}
      <span class="menu-hint">…</span>
    {:else}
      <button
        class="btn btn-wrong"
        onmousedown={(e) => e.preventDefault()}
        onclick={() => judge(false)}
      >✗ Wrong</button>
      <button
        class="btn btn-correct"
        onmousedown={(e) => e.preventDefault()}
        onclick={() => judge(true)}
      >✓ Correct</button>
    {/if}
  {/snippet}
</Desk>

<style>
  .timer-bar {
    flex-shrink: 0;
    height: 3px;
    background: var(--colors-skeleton-1-boundary);
  }
  .timer-fill {
    height: 100%;
    background: var(--colors-theme-primary-contrast);
    transition: width 50ms linear;
  }
  .timer-fill.timer-urgent {
    background: var(--colors-system-error-contrast);
  }

  .touch-layer {
    width: 100%;
    height: 100%;
  }
  .stage-inner {
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.05s;
    user-select: none;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .meta-type {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }

  .source-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0 0 1.5rem 0;
  }
  .source {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0;
    flex: 1;
  }
  .source-word { font-size: var(--font-size-3xl); }
  .audio-block {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .shown-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 80%, var(--colors-skeleton-2-surface));
  }
  .shown {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-100);
    margin: 0;
    line-height: 1.3;
  }
  .shown-word { font-size: var(--font-size-2xl); }

  .feedback {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    width: 100%;
  }
  .fb-line {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .fb-icon {
    font-size: var(--font-size-base);
    font-weight: 700;
    line-height: 1;
  }
  .fb-text {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .fb-ok .fb-icon, .fb-ok .fb-text { color: var(--colors-system-success-contrast); }
  .fb-miss .fb-icon, .fb-miss .fb-text { color: var(--colors-system-error-contrast); }

  .fb-answer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }
  .fb-answer-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .fb-answer-text {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-theme-primary-contrast);
  }

  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-code);
  }

  .btn {
    flex: 1;
    min-height: 48px;
    padding: 0.75rem 0.5rem;
    border-radius: 0.625rem;
    border: none;
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-wrong {
    background: var(--colors-system-error-surface);
    color: var(--colors-system-error-contrast);
  }
  .btn-correct {
    background: var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
  }

  @media (max-width: 640px) {
    .source { font-size: var(--font-size-xl); font-family: var(--font-family-sans-text); font-weight: 600; }
    .source-word { font-size: var(--font-size-2xl); }
    .shown { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); }
    .shown-word { font-size: var(--font-size-lg); }
  }
</style>

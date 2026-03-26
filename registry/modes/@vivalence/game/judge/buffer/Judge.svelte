<script>
  import { Keyboard, Asset } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const recall = data.recall ?? "LEARNING";
  const gameplay = data.gameplay ?? "visual";
  const speed = data.speed ?? {};
  let items = $state(data.items ?? []);
  let literals = $state(buffer.literals ?? []);

  const SPEED_PRESETS = {
    FAST: { base: 1500, multiplier: 80 },
    NORMAL: { base: 2500, multiplier: 120 },
    SLOW: { base: 3500, multiplier: 180 },
  };

  const resolvedSpeed = (() => {
    const preset = SPEED_PRESETS[speed.rate] ?? SPEED_PRESETS.NORMAL;
    return {
      base: speed.base ?? preset.base,
      multiplier: speed.multiplier ?? 0,
    };
  })();

  function computeTime(text) {
    if (!text) return resolvedSpeed.base;
    return resolvedSpeed.base + text.length * resolvedSpeed.multiplier;
  }

  let currentIndex = $state(0);
  let timer = $state(null);
  let elapsed = $state(0);
  let timeMs = $state(0);
  let results = $state([]);
  let judged = $state(false);
  let swiping = $state(null);
  let swipeX = $state(0);
  let touchStartX = $state(0);
  let done = $state(false);

  const item = $derived(items[currentIndex]);
  const target = $derived(item ? literals[item.target] : null);
  const isWord = $derived(target?.symbol?.word);
  const asset = $derived(
    (gameplay === "audio" || gameplay === "audio-only")
      ? terminal.daemon.getAsset(target?.trait?.VOCALIZED?.asset)
      : null,
  );

  const sourceText = $derived(
    target && gameplay !== "audio-only"
      ? (recall === "LEARNING" ? target.trait?.TRANSLATED?.learning : target.trait?.TRANSLATED?.known)
      : null,
  );

  const progress = $derived(timeMs > 0 ? elapsed / timeMs : 0);
  const urgent = $derived(progress >= 0.7);

  function startTimer() {
    elapsed = 0;
    judged = false;
    timeMs = computeTime(item?.shown);
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
    const actual = item.correct;
    const correct = !isTimeout && userSaysCorrect === actual;

    results = [...results, {
      target: item.target,
      distractor: item.distractor,
      correct,
      timeout: isTimeout,
    }];

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        currentIndex++;
        startTimer();
      } else {
        finish();
      }
    }, correct ? 200 : 800);
  }

  function finish() {
    done = true;
    for (const r of results) {
      const targetLit = literals[r.target];
      terminal.daemon.call("/review/literal", {
        signal: r.correct ? "SUCCESS" : "FAILURE",
        scope: { literal: targetLit.id },
      });
      if (!r.correct && r.distractor !== undefined) {
        const distractorLit = literals[r.distractor];
        if (distractorLit) {
          terminal.daemon.call("/review/literal", {
            signal: "FAILURE",
            scope: { literal: distractorLit.id },
          });
        }
      }
    }
    buffer.release();
  }

  function handleKey(event) {
    if (judged || done) return;
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

  if (!items.length && !literals.length) {
    terminal.daemon.call("/pick/literal/feed", { take: 4 }).then((lits) => {
      if (!lits?.length) return;
      literals = lits;
      const built = lits.map((lit, i) => {
        const t = lit.trait?.TRANSLATED;
        const targetText = recall === "LEARNING" ? t?.known : t?.learning;
        const others = lits.filter((_, j) => j !== i);
        const distractor = others[Math.floor(Math.random() * others.length)];
        const d = distractor?.trait?.TRANSLATED;
        const distractorText = recall === "LEARNING" ? d?.known : d?.learning;
        const coinFlip = Math.random() > 0.5;
        const canDistract = distractor && distractorText && distractorText !== targetText;
        const correct = coinFlip || !canDistract;
        return {
          target: i,
          shown: correct ? targetText : distractorText,
          correct,
          distractor: correct ? undefined : lits.indexOf(distractor),
        };
      });
      items = built;
      startTimer();
    });
  } else if (items.length) startTimer();
</script>

<Keyboard bind:this={keyboard} />
<svelte:window onkeydown={handleKey} />

<div class="bsp-node root">
  <div class="timer-bar">
    <div class="timer-fill" class:timer-urgent={urgent} style="width: {Math.max(0, 1 - progress) * 100}%"></div>
  </div>

  <div
    class="bsp-node content"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
  >
    <div class="stage" style="transform: translateX({swipeX * 0.3}px)">
      {#if target && !done}
        <div class="meta">
          <span class="meta-count">{currentIndex + 1}/{items.length}</span>
          {#if isWord}
            <span class="meta-type">word</span>
          {:else}
            <span class="meta-type">sentence</span>
          {/if}
        </div>

        {#if sourceText}
          <p class="source" class:source-word={isWord}>{sourceText}</p>
        {/if}

        {#if asset}
          <div class="audio-row">
            <Asset autoplay={true} {asset} />
          </div>
        {/if}

        <div class="shown-row">
          <p class="shown" class:shown-word={isWord}
            class:shown-correct={judged && item.correct}
            class:shown-wrong={judged && !item.correct}
          >
            {item.shown}
          </p>
        </div>

        {#if judged}
          <div class="feedback">
            {#if results[results.length - 1]?.correct}
              <span class="fb-ok">✓</span>
            {:else if results[results.length - 1]?.timeout}
              <span class="fb-timeout">time</span>
            {:else}
              <span class="fb-wrong">✗</span>
            {/if}
          </div>
        {/if}

      {:else if !items.length}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="input-row">
      {#if done}
        <span class="menu-hint">complete</span>
      {:else if judged}
        <span class="menu-hint">…</span>
      {:else}
        <button
          class="btn btn-wrong"
          ontouchstart={(e) => keyboard.guard(e)}
          onclick={() => judge(false)}
        >✗ Wrong</button>
        <button
          class="btn btn-correct"
          ontouchstart={(e) => keyboard.guard(e)}
          onclick={() => judge(true)}
        >✓ Correct</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .root { grid-template-rows: auto 1fr auto; }
  .content { overflow: hidden; }

  .timer-bar {
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

  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 15vh 1.25rem 2rem;
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
  .meta-count {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .meta-type {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .source {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 1.5rem 0;
  }
  .source-word { font-size: var(--font-size-3xl); }

  .audio-row { margin-bottom: 1rem; }

  .shown-row {
    padding: 1rem 1.5rem;
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
  .shown-correct { color: var(--colors-system-success-contrast); }
  .shown-wrong { color: var(--colors-system-error-contrast); }

  .feedback {
    margin-top: 1rem;
    font-size: var(--font-size-2xl);
  }
  .fb-ok { color: var(--colors-system-success-contrast); }
  .fb-wrong { color: var(--colors-system-error-contrast); }
  .fb-timeout {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-system-error-contrast);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2rem;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px));
  }
  .input-row {
    max-width: 480px;
    margin: 0 auto;
    display: flex;
    gap: 0.75rem;
  }
  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  .btn {
    flex: 1;
    padding: 1rem 0.5rem;
    border-radius: 0.625rem;
    border: none;
    font-size: 1rem;
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
    .stage { padding-top: 8vh; padding-left: 1rem; padding-right: 1rem; }
    .source { font-size: var(--font-size-xl); font-family: var(--font-family-sans-text); font-weight: 600; margin-bottom: 1.25rem; }
    .source-word { font-size: var(--font-size-2xl); }
    .shown-row { padding: 1rem 1.25rem; }
    .shown { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); }
    .shown-word { font-size: var(--font-size-lg); }
    .btn { padding: 1.125rem 0.5rem; font-size: 1.05rem; }
    .menu { padding: 1.25rem 1rem calc(1.25rem + env(safe-area-inset-bottom, 0px)); }
  }
</style>

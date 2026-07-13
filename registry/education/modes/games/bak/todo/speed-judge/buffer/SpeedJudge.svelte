<script>
  import { words, sentences, pickOne, exclude } from "../../data.js";

  const pool = [
    ...words.filter((w) => ["noun", "adjective"].includes(w.pos)).map((w) => ({ ...w, type: "word" })),
    ...sentences.map((s) => ({ ...s, type: "sentence" })),
  ];

  let item = $state(null);
  let shown = $state("");
  let correct = $state(true);
  let timeMs = $state(3000);
  let elapsed = $state(0);
  let answered = $state(false);
  let result = $state(null);
  let interval = $state(null);

  function computeTime(it) {
    const len = it.learning.length;
    const base = it.type === "sentence" ? 3500 : 2000;
    return base + len * 100;
  }

  function generate() {
    const it = pickOne(pool);
    const isCorrect = Math.random() > 0.4;
    const sameType = pool.filter((x) => x.type === it.type && x.slug !== it.slug);
    item = it;
    correct = isCorrect;
    shown = isCorrect ? it.known : pickOne(sameType).known;
    timeMs = computeTime(it);
    elapsed = 0;
    answered = false;
    result = null;
    startTimer();
  }

  function startTimer() {
    clearInterval(interval);
    interval = setInterval(() => {
      elapsed += 50;
      if (elapsed >= timeMs) {
        clearInterval(interval);
        if (!answered) judge(null);
      }
    }, 50);
  }

  function judge(yes) {
    clearInterval(interval);
    answered = true;
    result = yes === null ? null : yes === correct;
  }

  function next() {
    clearInterval(interval);
    generate();
  }

  generate();

  const pct = $derived(Math.max(0, 1 - elapsed / timeMs));
  const urgent = $derived(pct <= 0.3);

  const bgClass = $derived(
    !answered ? "" : result === null ? "bg-timeout" : result ? "bg-correct" : "bg-wrong"
  );
</script>

<div class="bsp-node root {bgClass}">
  <div class="timer-rail">
    <div class="timer-fill" class:timer-urgent={urgent} style="width: {pct * 100}%"></div>
  </div>

  <div class="bsp-node content">
    <div class="stage">
      <div class="prompt">{item?.learning}</div>
      <div class="divider"></div>
      <div class="shown">{shown}</div>

      {#if answered}
        <div class="verdict" class:verdict-correct={result === true} class:verdict-wrong={result === false} class:verdict-timeout={result === null}>
          {result === null ? "TIME" : result ? "CORRECT" : "WRONG"}
        </div>
        {#if !correct}
          <div class="actual">→ {item?.known}</div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="actions">
      {#if !answered}
        <button class="btn btn-correct" onclick={() => judge(true)}>Correct</button>
        <button class="btn btn-wrong" onclick={() => judge(false)}>Wrong</button>
      {:else}
        <button class="btn btn-next" onclick={next}>Next →</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .root {
    grid-template-rows: auto 1fr auto;
    transition: background 0.3s;
    background: var(--colors-skeleton-app-surface);
  }

  .bg-correct { background: color-mix(in srgb, var(--colors-system-success-surface) 20%, var(--colors-skeleton-app-surface)); }
  .bg-wrong { background: color-mix(in srgb, var(--colors-system-error-surface) 20%, var(--colors-skeleton-app-surface)); }
  .bg-timeout { background: color-mix(in srgb, var(--colors-system-warning-surface) 15%, var(--colors-skeleton-app-surface)); }

  .timer-rail {
    height: 2px;
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

  .content { overflow-y: auto; }

  .stage {
    max-width: 520px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 100%;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-3xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.12;
    letter-spacing: -0.02em;
  }

  .divider {
    width: 2rem;
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin: 1.25rem 0;
  }

  .shown {
    font-size: var(--font-size-xl);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
    font-weight: 300;
  }

  .verdict {
    margin-top: 1.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    font-family: var(--font-family-sans-text);
  }

  .verdict-correct { color: var(--colors-system-success-contrast); }
  .verdict-wrong { color: var(--colors-system-error-contrast); }
  .verdict-timeout { color: var(--colors-system-warning-contrast); }

  .actual {
    margin-top: 0.5rem;
    font-size: 0.825rem;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
  }

  .menu { padding: 0 1.5rem 1.25rem; }

  .actions {
    max-width: 520px;
    margin: 0 auto;
    display: flex;
    gap: 0.625rem;
  }

  .btn {
    flex: 1;
    padding: 1rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  .btn-correct {
    background: transparent;
    border: 1px solid var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
  }

  .btn-wrong {
    background: transparent;
    border: 1px solid var(--colors-system-error-surface);
    color: var(--colors-system-error-contrast);
  }

  .btn-next {
    background: transparent;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-palette-gray-200);
  }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-2xl); }
    .shown { font-size: var(--font-size-lg); }
    .stage { padding: 0 1rem; }
    .menu { padding: 0 1rem 1rem; }
  }
</style>

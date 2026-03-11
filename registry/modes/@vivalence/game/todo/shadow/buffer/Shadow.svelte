<script>
  import { words, sentences, pickOne } from "../../data.js";

  const pool = [
    ...words.map((w) => ({ ...w, type: "word" })),
    ...sentences.map((s) => ({ ...s, type: "sentence" })),
  ];

  let item = $state(null);
  let phase = $state("show");
  let input = $state("");
  let submitted = $state(false);
  let timeMs = $state(4000);
  let elapsed = $state(0);
  let interval = $state(null);

  function computeTime(it) {
    const len = it.learning.length;
    const base = it.type === "sentence" ? 3000 : 1800;
    return base + len * 120;
  }

  function generate() {
    const it = pickOne(pool);
    item = it;
    timeMs = computeTime(it);
    elapsed = 0;
    phase = "show";
    input = "";
    submitted = false;
    startTimer();
  }

  function startTimer() {
    clearInterval(interval);
    interval = setInterval(() => {
      elapsed += 50;
      if (elapsed >= timeMs) {
        clearInterval(interval);
        phase = "recall";
      }
    }, 50);
  }

  const normalize = (s) => s.toLowerCase().replace(/[?.!,;:]/g, "").trim();
  const isCorrect = $derived(submitted && normalize(input) === normalize(item?.learning ?? ""));
  const pct = $derived(Math.max(0, 1 - elapsed / timeMs));

  function submit() {
    if (!input.trim() || submitted) return;
    submitted = true;
  }

  function next() {
    clearInterval(interval);
    generate();
  }

  function handleKey(e) {
    if (e.key === "Enter" && phase === "recall") {
      if (!submitted) submit();
      else next();
    }
  }

  generate();
</script>

<svelte:window onkeydown={handleKey} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">
      {#if phase === "show"}
        <div class="progress">
          <div class="progress-fill" style="width: {pct * 100}%"></div>
        </div>

        <div class="meta">
          <span class="meta-phase meta-phase-show">memorize</span>
          <span class="meta-type">{item?.type}</span>
          <span class="meta-time">{(timeMs / 1000).toFixed(1)}s</span>
        </div>

        <p class="prompt" class:prompt-word={item?.type === "word"}>
          {item?.learning}
        </p>
        <p class="translation">{item?.known}</p>

      {:else}
        <div class="meta">
          <span class="meta-phase meta-phase-recall">recall</span>
        </div>

        <p class="translation recall-prompt">{item?.known}</p>

        {#if submitted}
          <div class="divider"></div>

          <div class="feedback">
            <div class="fb-row">
              <span class="fb-dot" class:fb-ok={isCorrect} class:fb-wrong={!isCorrect}></span>
              <span class="fb-label" class:fb-ok={isCorrect} class:fb-wrong={!isCorrect}>
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <div class="fb-block">
              <span class="fb-key">yours</span>
              <span class="fb-yours" class:fb-yours-ok={isCorrect} class:fb-yours-strike={!isCorrect}>
                {input}
              </span>
            </div>

            {#if !isCorrect}
              <div class="fb-block">
                <span class="fb-key">expected</span>
                <span class="fb-expected">{item?.learning}</span>
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="input-row">
      {#if phase === "show"}
        <span class="menu-hint">reading...</span>
      {:else if !submitted}
        <input
          class="field"
          value={input}
          oninput={(e) => input = e.target.value}
          placeholder="Type from memory..."
          autofocus
        />
        <button class="btn-check" onclick={submit}>Check</button>
      {:else}
        <button class="btn-next" onclick={next}>Next →</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .root { grid-template-rows: 1fr auto; }
  .content { overflow-y: auto; }

  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 15vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .progress {
    height: 3px;
    background: var(--colors-skeleton-1-boundary);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 1.25rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--colors-system-warning-contrast);
    transition: width 50ms linear;
    border-radius: 2px;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .meta-phase, .meta-type, .meta-time {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .meta-phase-show { color: var(--colors-theme-accent-contrast); }
  .meta-phase-recall { color: var(--colors-theme-primary-contrast); }
  .meta-type { color: var(--colors-skeleton-1-boundary); font-weight: 500; }
  .meta-time { color: var(--colors-theme-primary-contrast); }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 0.5rem 0;
  }

  .prompt-word { font-size: var(--font-size-3xl); }

  .translation {
    font-size: 0.95rem;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
    margin: 0;
  }

  .recall-prompt {
    font-size: var(--font-size-lg);
    margin-bottom: 1.25rem;
  }

  .divider {
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin-bottom: 1rem;
  }

  .feedback {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .fb-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.125rem;
  }

  .fb-dot { width: 8px; height: 8px; border-radius: 50%; }
  .fb-dot.fb-ok { background: var(--colors-system-success-contrast); }
  .fb-dot.fb-wrong { background: var(--colors-system-error-contrast); }

  .fb-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: var(--font-family-sans-text);
  }

  .fb-label.fb-ok { color: var(--colors-system-success-contrast); }
  .fb-label.fb-wrong { color: var(--colors-system-error-contrast); }

  .fb-block { display: flex; flex-direction: column; gap: 0.125rem; }

  .fb-key {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .fb-yours { font-size: 1.125rem; font-family: var(--font-family-sans-text); }
  .fb-yours-ok { color: var(--colors-system-success-contrast); }
  .fb-yours-strike {
    color: var(--colors-system-error-contrast);
    text-decoration: line-through;
    text-decoration-color: var(--colors-system-error-surface);
  }

  .fb-expected {
    font-family: var(--font-family-serif-heading);
    font-size: 1.25rem;
    color: var(--colors-theme-primary-contrast);
  }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1rem 1.25rem;
  }

  .input-row {
    max-width: 480px;
    margin: 0 auto;
    display: flex;
    gap: 0.625rem;
    align-items: center;
  }

  .field {
    flex: 1;
    padding: 0.875rem 1.125rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, var(--colors-skeleton-app-surface));
    color: var(--colors-palette-gray-10);
    font-size: 1.0625rem;
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }

  .field::placeholder { color: var(--colors-skeleton-1-boundary); }

  .btn-check {
    padding: 0.875rem 1.75rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
  }

  .btn-next {
    width: 100%;
    padding: 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.875rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.75rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .stage { padding-top: 10vh; }
    .prompt { font-size: var(--font-size-xl); }
    .prompt-word { font-size: var(--font-size-2xl); }
    .menu { padding: 0.75rem 1rem; }
  }
</style>

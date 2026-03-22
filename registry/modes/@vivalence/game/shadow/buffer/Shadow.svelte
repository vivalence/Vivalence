<script>
  import { Keyboard } from "@vivalence/drapes";

  const { terminal, buffer, forgiving = true } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const speed = data.speed ?? {};
  const randomRecall = () => (Math.random() > 0.5 ? "KNOWN" : "LEARNING");

  let activeRecall = $state(data.recall ?? randomRecall());
  let literal = $state(buffer.literals?.[0] ?? null);
  let loading = $state(!literal);
  let phase = $state("show");
  let input = $state("");
  let submitted = $state(false);
  let result = $state(null);
  let elapsed = $state(0);
  let timerInterval = $state(null);

  const isWord = $derived(literal?.symbol?.word);
  const known = $derived(literal?.trait?.TRANSLATED?.known);
  const learning = $derived(literal?.trait?.TRANSLATED?.learning);
  const prompt = $derived(activeRecall === "KNOWN" ? learning : known);
  const answer = $derived(activeRecall === "KNOWN" ? known : learning);
  const promptLabel = $derived(activeRecall === "KNOWN" ? "Português" : "English");
  const answerLabel = $derived(activeRecall === "KNOWN" ? "English" : "Português");

  const SPEED_PRESETS = {
    FAST: { base: 1200, multiplier: 80 },
    NORMAL: { base: 2400, multiplier: 120 },
    SLOW: { base: 3600, multiplier: 180 },
  };

  const resolvedSpeed = (() => {
    const preset = SPEED_PRESETS[speed.rate] ?? SPEED_PRESETS.NORMAL;
    return {
      base: speed.base ?? preset.base,
      multiplier: speed.multiplier ?? preset.multiplier,
    };
  })();

  const timeMs = $derived.by(() => {
    if (!answer) return resolvedSpeed.base;
    return resolvedSpeed.base + answer.length * resolvedSpeed.multiplier;
  });

  const progress = $derived(Math.max(0, 1 - elapsed / timeMs));

  const pick = async () => {
    const [lit] = await terminal.daemon.call("/pick/literal/feed", { take: 1 });
    return lit ?? null;
  };

  const norm = forgiving
    ? (s) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[?.!,;:'"'´`~\-—]/g, "")
          .trim()
    : (s) => s.toLowerCase().trim();

  function evaluate(input, lit, currentRecall, word) {
    const expected =
      currentRecall === "KNOWN" ? lit.trait.TRANSLATED.known : lit.trait.TRANSLATED.learning;
    if (word) return evaluateWord(input, expected);
    return evaluateSentence(input, expected, lit.trait.ANNOTATED?.tokens, currentRecall);
  }

  function evaluateWord(input, expected) {
    const alts = expected
      .split("/")
      .map((alt) => alt.replace(/\(.*?\)/g, "").trim())
      .filter(Boolean);
    const match = alts.some((alt) => norm(input) === norm(alt));
    return { signal: match ? "SUCCESS" : "MISTAKE", tokens: null };
  }

  function evaluateSentence(input, expected, tokens, currentRecall) {
    const match = norm(input) === norm(expected);

    if (!tokens) {
      return { signal: match ? "SUCCESS" : "MISTAKE", tokens: null };
    }

    if (currentRecall === "KNOWN") {
      const signal = match ? "SUCCESS" : "MISTAKE";
      return { signal, tokens: tokens.map((tok) => ({ ...tok, signal })) };
    }

    const remaining = norm(input).split(/\s+/);
    const results = tokens.map((tok) => {
      const parts = norm(tok.form).split(/\s+/);
      const found = parts.every((part) => {
        const index = remaining.indexOf(part);
        if (index === -1) return false;
        remaining.splice(index, 1);
        return true;
      });
      return { ...tok, signal: found ? "SUCCESS" : "MISTAKE" };
    });

    const correct = results.filter((tok) => tok.signal === "SUCCESS").length;
    const total = results.length;
    const signal = correct === total ? "SUCCESS" : correct === 0 ? "FAILURE" : "MISTAKE";

    return { signal, tokens: results };
  }

  function review(result) {
    const scope = { buffer: buffer.id };
    terminal.daemon.call("/review/buffer", { signal: result.signal, scope });

    if (result.tokens) {
      for (const tok of result.tokens) {
        if (!tok.literal) continue;
        terminal.daemon.call("/review/literal", {
          signal: tok.signal,
          scope: { literal: tok.literal },
        });
      }
    }
  }

  function skipToRecall() {
    clearInterval(timerInterval);
    phase = "recall";
  }

  function startTimer() {
    clearInterval(timerInterval);
    elapsed = 0;
    timerInterval = setInterval(() => {
      elapsed += 50;
      if (elapsed >= timeMs) {
        clearInterval(timerInterval);
        phase = "recall";
      }
    }, 50);
  }

  function begin(lit) {
    literal = lit;
    loading = false;
    phase = "show";
    startTimer();
  }

  if (literal) {
    begin(literal);
  } else {
    pick().then((value) => {
      if (value) begin(value);
      else loading = false;
    });
  }

  function submit() {
    if (!input.trim() || submitted) return;
    submitted = true;
    result = evaluate(input, literal, activeRecall, isWord);
    review(result);
  }

  async function next() {
    clearInterval(timerInterval);
    buffer.release();
  }

  $effect(() => {
    if (phase === "show") keyboard?.focus();
  });

  function handleKey(event) {
    if (event.key === "Enter") {
      if (phase === "show") return skipToRecall();
      if (!submitted) submit();
      else next();
    }
  }
</script>

<Keyboard bind:this={keyboard} />
<svelte:window onkeydown={handleKey} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">
      {#if literal}
        {#if phase === "show"}
          <div class="progress">
            <div class="progress-fill" style="width: {progress * 100}%"></div>
          </div>

          <div class="meta">
            <span class="meta-phase meta-phase-show"
              >memorize {activeRecall === "KNOWN" ? "known" : "learning"}</span>
            <span class="meta-type">{isWord ? "word" : "sentence"}</span>
            <span class="meta-time">{(timeMs / 1000).toFixed(1)}s</span>
            <span class="meta-hint">{speed.rate?.toLowerCase() ?? "normal"}</span>
            {#if forgiving}<span class="meta-hint">forgiving</span>{/if}
          </div>

          <p class="prompt" class:prompt-word={isWord}>{answer}</p>
          <p class="translation">{prompt}</p>
        {:else}
          <div class="meta">
            <span class="meta-phase meta-phase-recall"
              >recall {activeRecall === "KNOWN" ? "known" : "learning"}</span>
            <span class="meta-type">{isWord ? "word" : "sentence"}</span>
            <span class="meta-hint">{speed.rate?.toLowerCase() ?? "normal"}</span>
            {#if forgiving}<span class="meta-hint">forgiving</span>{/if}
          </div>

          <p class="translation recall-prompt">{prompt}</p>

          {#if submitted && result}
            <div class="divider"></div>

            <div class="feedback">
              <div class="signal">
                <span
                  class="signal-dot"
                  class:ok={result.signal === "SUCCESS"}
                  class:wrong={result.signal !== "SUCCESS"}></span>
                <span
                  class="signal-text"
                  class:ok={result.signal === "SUCCESS"}
                  class:wrong={result.signal !== "SUCCESS"}>
                  {result.signal === "SUCCESS" ? "Correct" : "Incorrect"}
                </span>
              </div>

              <div class="fb-block">
                <span class="fb-key">yours</span>
                <span
                  class="fb-val"
                  class:ok={result.signal === "SUCCESS"}
                  class:wrong={result.signal !== "SUCCESS"}>
                  {input}
                </span>
              </div>

              {#if result.signal !== "SUCCESS"}
                <div class="fb-block">
                  <span class="fb-key">expected</span>
                  <span class="fb-answer">{answer}</span>
                </div>
              {/if}

              {#if result.tokens}
                <div class="tokens">
                  {#each result.tokens as tok}
                    <div
                      class="tok"
                      class:tok-ok={tok.signal === "SUCCESS"}
                      class:tok-miss={tok.signal !== "SUCCESS"}>
                      <span class="tok-form">{tok.form}</span>
                      <span class="tok-gloss">{tok.gloss}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="input-row">
      {#if phase === "show"}
        <span class="menu-hint" ontouchstart={(e) => keyboard?.guard(e)}>reading...</span>
      {:else}
        <input
          class="field"
          value={input}
          oninput={(event) => (input = event.target.value)}
          placeholder="{answerLabel}…"
          disabled={submitted}
          autofocus />
        {#if !submitted}
          <button class="btn-check" onclick={submit} disabled={loading || !literal}>Check</button>
        {:else}
          <button class="btn-next" onclick={next} disabled={loading}>Next →</button>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }
  .content {
    overflow-y: auto;
  }

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
    align-items: baseline;
  }

  .meta-phase,
  .meta-type,
  .meta-time {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .meta-phase-show {
    color: var(--colors-theme-accent-contrast);
  }
  .meta-phase-recall {
    color: var(--colors-theme-primary-contrast);
  }
  .meta-type {
    color: var(--colors-skeleton-1-boundary);
    font-weight: 500;
  }
  .meta-time {
    color: var(--colors-theme-primary-contrast);
  }
  .meta-hint {
    font-family: var(--font-family-code);
    font-size: 0.55rem;
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.6;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 0.5rem 0;
  }
  .prompt-word {
    font-size: var(--font-size-3xl);
  }

  .translation {
    font-size: 0.95rem;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
    margin: 0;
  }

  .recall-prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-palette-gray-10);
    margin-bottom: 1.25rem;
  }

  .divider {
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin: 1.5rem 0;
  }

  .feedback {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .signal {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  .signal-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .signal-dot.ok {
    background: var(--colors-system-success-contrast);
  }
  .signal-dot.wrong {
    background: var(--colors-system-error-contrast);
  }
  .signal-text {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: var(--font-family-sans-text);
  }
  .signal-text.ok {
    color: var(--colors-system-success-contrast);
  }
  .signal-text.wrong {
    color: var(--colors-system-error-contrast);
  }

  .fb-block {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .fb-key {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .fb-val {
    font-size: 1.125rem;
    font-family: var(--font-family-sans-text);
  }
  .fb-val.ok {
    color: var(--colors-system-success-contrast);
  }
  .fb-val.wrong {
    color: var(--colors-system-error-contrast);
  }
  .fb-answer {
    font-family: var(--font-family-serif-heading);
    font-size: 1.25rem;
    color: var(--colors-theme-primary-contrast);
  }

  .tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.125rem;
    margin-top: 0.25rem;
  }
  .tok {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
  }
  .tok-ok {
    background: color-mix(in srgb, var(--colors-system-success-contrast) 12%, transparent);
  }
  .tok-miss {
    background: color-mix(in srgb, var(--colors-system-error-contrast) 12%, transparent);
  }
  .tok-form {
    font-family: var(--font-family-serif-heading);
    font-size: 1rem;
    line-height: 1.2;
  }
  .tok-ok .tok-form {
    color: var(--colors-system-success-contrast);
  }
  .tok-miss .tok-form {
    color: var(--colors-system-error-contrast);
  }
  .tok-gloss {
    font-family: var(--font-family-code);
    font-size: 0.55rem;
    color: var(--colors-skeleton-1-boundary);
    margin-top: 0.125rem;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2rem;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
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
    background: color-mix(
      in srgb,
      var(--colors-skeleton-1-surface) 50%,
      var(--colors-skeleton-app-surface)
    );
    color: var(--colors-palette-gray-10);
    font-size: 1.0625rem;
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }
  .field::placeholder {
    color: var(--colors-skeleton-1-boundary);
  }
  .field:disabled {
    opacity: 0.4;
  }
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
  .btn-check:disabled {
    opacity: 0.4;
    cursor: default;
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
  .btn-next:disabled {
    opacity: 0.4;
    cursor: default;
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
    .stage {
      padding-top: 10vh;
    }
    .prompt {
      font-size: var(--font-size-xl);
    }
    .prompt-word {
      font-size: var(--font-size-2xl);
    }
    .menu {
      padding: 0.75rem 1rem;
    }
  }
</style>

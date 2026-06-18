<script>
  import { string } from "@vivalence/typology";
  import { Asset, Desk, Keyboard, ViewportLock } from "@vivalence/drapes";

  const { terminal, buffer, forgiving = true } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const speed = data.speed ?? {};
  const queue = buffer.literals ?? [];

  function recallFor(i) {
    const r = data.recall;
    if (!r) return Math.random() > 0.5 ? "KNOWN" : "LEARNING";
    if (Array.isArray(r)) return r[i] ?? (Math.random() > 0.5 ? "KNOWN" : "LEARNING");
    return r;
  }

  let currentIndex = $state(0);
  let activeRecall = $state(recallFor(0));
  let literal = $state(queue[0] ?? null);
  let loading = $state(!literal);
  let phase = $state("show");
  let input = $state("");
  let submitted = $state(false);
  let result = $state(null);
  let elapsed = $state(0);
  let timerInterval = $state(null);

  let editingIndex = $state(null);
  let editValue = $state("");
  let corrections = $state(new Set());
  let editInputEl = $state(null);

  function startCorrection(i) {
    const tok = result?.tokens?.[i];
    if (!tok) return;
    if (tok.signal === "SUCCESS" || corrections.has(i)) return;
    editingIndex = i;
    editValue = "";
  }

  function commitCorrection(i) {
    const tok = result?.tokens?.[i];
    if (!tok) {
      editingIndex = null;
      editValue = "";
      return;
    }
    if (editValue.trim() === tok.form) {
      corrections.add(i);
      corrections = new Set(corrections);
      editingIndex = null;
      editValue = "";
    } else {
      editValue = "";
    }
  }

  function handleCorrectionKey(event, i) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      commitCorrection(i);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      editingIndex = null;
      editValue = "";
    }
  }

  const total = $derived(queue.length);
  const position = $derived(currentIndex + 1);

  const isWord = $derived(literal?.symbol?.word);
  const asset = $derived(terminal.daemon.getAsset(literal?.trait?.VOCALIZED?.asset));
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

  const norm = forgiving ? string.fold : (s) => s.toLowerCase().trim();

  function evaluate(input, lit, currentRecall, word) {
    const expected =
      currentRecall === "KNOWN" ? lit.trait.TRANSLATED.known : lit.trait.TRANSLATED.learning;
    if (word) return evaluateWord(input, expected);
    return evaluateSentence(input, expected, lit.trait.ANNOTATED?.tokens, currentRecall);
  }

  function evaluateWord(input, expected) {
    return {
      signal: string.matches(input, expected, { forgiving }) ? "SUCCESS" : "MISTAKE",
      tokens: null,
    };
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
    const signal = correct === total ? "SUCCESS" : correct === 0 ? "MISTAKE" : "MISTAKE";

    return { signal, tokens: results };
  }

  function review(result) {
    terminal.daemon.call("/review/literal", {
      signal: result.signal,
      scope: { literal: literal.id },
    });

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
    terminal.daemon.call("/pick/literal/feed", { limit: 3 }).then((lits) => {
      if (lits?.length) {
        for (const l of lits) queue.push(l);
        begin(queue[0]);
      } else {
        loading = false;
      }
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
    if (currentIndex + 1 < queue.length) {
      currentIndex++;
      activeRecall = recallFor(currentIndex);
      input = "";
      submitted = false;
      result = null;
      corrections = new Set();
      editingIndex = null;
      editValue = "";
      begin(queue[currentIndex]);
    } else {
      buffer.release();
    }
  }

  let inputEl = $state(null);

  $effect(() => {
    if (phase === "recall" && inputEl) {
      inputEl.focus();
    } else if (phase === "show" && keyboard) {
      keyboard.focus();
    }
  });

  $effect(() => {
    if (editingIndex !== null && editInputEl) editInputEl.focus();
  });

  function handleKey(event) {
    if (editingIndex !== null) return;
    if (event.key === "Enter") {
      if (phase === "show") return skipToRecall();
      if (!submitted) submit();
      else next();
    }
  }
</script>

<Keyboard bind:this={keyboard} />
<ViewportLock />
<svelte:window onkeydown={handleKey} />

<Desk maxWidth="640px">
  {#snippet surface()}
    {#if literal}
      {#if phase === "show"}
        <div class="progress">
          <div class="progress-fill" style="width: {progress * 100}%"></div>
        </div>

        <div class="meta">
          <span class="meta-phase meta-phase-show"
            >memorize {activeRecall === "KNOWN" ? "known" : "learning"}</span>
          <span class="meta-type">{isWord ? "word" : "sentence"}</span>
          {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
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
          {#if asset}
            <div class="audio-block"><Asset autoplay={true} {asset} /></div>
          {/if}
        </div>

        <p class="translation recall-prompt">{prompt}</p>

        {#if submitted && result}
          <div class="divider"></div>

          <div class="feedback">
            <div class="fb-block">
              <span
                class="fb-val"
                class:ok={result.signal === "SUCCESS"}
                class:wrong={result.signal !== "SUCCESS"}>
                {result.signal === "SUCCESS" ? answer : input}
              </span>
            </div>

            {#if result.signal !== "SUCCESS"}
              <div class="fb-block">
                <span class="fb-key">expected</span>
                <span class="fb-val ok">{answer}</span>
              </div>
            {/if}

            {#if result.tokens}
              <div class="tokens">
                {#each result.tokens as tok, i}
                  {@const isOk = tok.signal === "SUCCESS" || corrections.has(i)}
                  {#if editingIndex === i}
                    <div class="tok tok-edit">
                      <input
                        class="tok-input"
                        bind:this={editInputEl}
                        bind:value={editValue}
                        size={Math.max(4, (tok.form?.length ?? 4) + 1)}
                        onkeydown={(event) => handleCorrectionKey(event, i)}
                        onblur={() => commitCorrection(i)}
                        placeholder={tok.form} />
                      <span class="tok-gloss">{tok.gloss}</span>
                    </div>
                  {:else}
                    <button
                      type="button"
                      class="tok"
                      class:tok-ok={isOk}
                      class:tok-miss={!isOk}
                      disabled={isOk}
                      onmousedown={(event) => event.preventDefault()}
                      onclick={() => startCorrection(i)}>
                      <span class="tok-form">{tok.form}</span>
                      <span class="tok-gloss">{tok.gloss}</span>
                    </button>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    {:else if loading}
      <div class="loading"><span class="dot"></span></div>
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if phase === "show"}
      <button class="btn btn-skip" onmousedown={(e) => e.preventDefault()} onclick={skipToRecall}>I'm ready</button>
    {:else}
      {#if !submitted}
        <input
          class="field"
          bind:this={inputEl}
          value={input}
          oninput={(event) => { input = event.target.value; }}
          placeholder="{answerLabel}…" />
        <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submit} disabled={loading || !literal}>Check</button>
      {:else}
        <span
          class="fb-glyph"
          class:ok={result?.signal === "SUCCESS"}
          class:wrong={result?.signal !== "SUCCESS"}>
          {result?.signal === "SUCCESS" ? "✓" : "✗"}
        </span>
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={next} disabled={loading}>Next →</button>
      {/if}
    {/if}
  {/snippet}
</Desk>

<style>
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
  .meta-phase, .meta-type, .meta-time {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .meta-phase-show { color: var(--colors-theme-accent-contrast); }
  .meta-phase-recall { color: var(--colors-theme-primary-contrast); }
  .meta-type { color: var(--colors-skeleton-1-boundary); font-weight: 500; }
  .meta-time { color: var(--colors-theme-primary-contrast); }
  .meta-hint {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.6;
  }
  .audio-block {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 0.5rem 0;
  }
  .prompt-word { font-size: var(--font-size-3xl); }

  .translation {
    font-size: var(--font-size-base);
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

  .fb-block { display: flex; flex-direction: column; gap: 0.125rem; }
  .fb-key { font-family: var(--font-family-code); font-size: var(--font-size-xs); color: var(--colors-skeleton-1-boundary); }
  .fb-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 48px;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-lg);
    font-family: var(--font-family-code);
    flex-shrink: 0;
    box-sizing: border-box;
  }
  .fb-glyph.ok { color: var(--colors-system-success-contrast); border-color: var(--colors-system-success-contrast); }
  .fb-glyph.wrong { color: var(--colors-system-error-contrast); border-color: var(--colors-system-error-contrast); }
  .fb-val { font-size: var(--font-size-lg); font-family: var(--font-family-serif-heading); }
  .fb-val.ok { color: var(--colors-system-success-contrast); }
  .fb-val.wrong { color: var(--colors-system-error-contrast); }

  .tokens { display: flex; flex-wrap: wrap; gap: 0.125rem; margin-top: 0.25rem; }
  .tok {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: center;
    cursor: pointer;
  }
  .tok:disabled { cursor: default; }
  .tok-edit {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
    background: color-mix(in srgb, var(--colors-theme-primary-contrast) 12%, transparent);
  }
  .tok-input {
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    color: var(--colors-palette-gray-10);
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    line-height: 1.2;
    text-align: center;
  }
  .tok-ok { background: color-mix(in srgb, var(--colors-system-success-contrast) 12%, transparent); }
  .tok-miss { background: color-mix(in srgb, var(--colors-system-error-contrast) 12%, transparent); }
  .tok-form { font-family: var(--font-family-serif-heading); font-size: var(--font-size-base); line-height: 1.2; }
  .tok-ok .tok-form { color: var(--colors-system-success-contrast); }
  .tok-miss .tok-form { color: var(--colors-system-error-contrast); }
  .tok-gloss { font-family: var(--font-family-code); font-size: var(--font-size-2xs); color: var(--colors-skeleton-1-boundary); margin-top: 0.125rem; }

  .loading { display: flex; align-items: center; justify-content: center; padding-top: 2rem; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--colors-skeleton-1-boundary); animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .field {
    flex: 1;
    min-width: 0;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, var(--colors-skeleton-app-surface));
    color: var(--colors-palette-gray-10);
    font-size: var(--font-size-base);
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }
  .field::placeholder { color: var(--colors-skeleton-1-boundary); }

  .btn {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: none;
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn:disabled { opacity: 0.4; cursor: default; }
  .btn-check {
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .btn-next {
    flex: 1;
    border: 1px solid var(--colors-theme-primary-contrast);
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 35%, transparent);
    color: var(--colors-theme-primary-contrast);
    font-weight: 600;
  }
  .btn-next:hover:not(:disabled) {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 55%, transparent);
  }
  .btn-skip {
    flex: 1;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-base); }
    .prompt-word { font-size: var(--font-size-lg); }
    .recall-prompt { font-size: var(--font-size-base); }
    .fb-val { font-size: var(--font-size-base); }
    .tok { padding: 0.25rem 0.375rem; }
    .tok-form { font-size: var(--font-size-md); }
  }
</style>

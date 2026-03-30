<script>
  import { Asset, ViewportLock } from "@vivalence/drapes";

  const { terminal, buffer, forgiving = true } = $props();

  const data = buffer.data ?? {};
  const queue = buffer.literals ?? [];

  function recallFor(i) {
    const r = data.recall;
    if (!r) return Math.random() > 0.5 ? "KNOWN" : "LEARNING";
    if (Array.isArray(r)) return r[i] ?? (Math.random() > 0.5 ? "KNOWN" : "LEARNING");
    return r;
  }

  let currentIndex = $state(0);
  let literal = $state(queue[0] ?? null);
  let loading = $state(!literal);
  let activeRecall = $state(recallFor(0));
  let input = $state("");
  let submitted = $state(false);
  let result = $state(null);

  const total = $derived(queue.length);
  const position = $derived(currentIndex + 1);

  const isWord = $derived(literal?.symbol?.word);
  const known = $derived(literal?.trait?.TRANSLATED?.known);
  const learning = $derived(literal?.trait?.TRANSLATED?.learning);
  const example = $derived(literal?.trait?.EXEMPLIFIED);
  const asset = $derived(terminal.daemon.getAsset(literal?.trait?.VOCALIZED?.asset));
  const prompt = $derived(activeRecall === "KNOWN" ? learning : known);
  const answer = $derived(activeRecall === "KNOWN" ? known : learning);
  const promptEx = $derived(
    example && (activeRecall === "KNOWN" ? example.learning : example.known),
  );
  const answerEx = $derived(
    example && (activeRecall === "KNOWN" ? example.known : example.learning),
  );
  const promptLabel = $derived(activeRecall === "KNOWN" ? "Português" : "English");
  const answerLabel = $derived(activeRecall === "KNOWN" ? "English" : "Português");

  if (!literal) {
    terminal.daemon.call("/pick/literal/feed", { limit: 3 }).then((lits) => {
      if (lits?.length) {
        for (const l of lits) queue.push(l);
        literal = queue[0];
      }
      loading = false;
    });
  }

  const norm = forgiving
    ? (s) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[?.!,;:'"'´`~\-—]/g, "")
          .trim()
    : (s) => s.toLowerCase().trim();

  const parseAlts = (s) =>
    s
      .split("/")
      .map((alt) => alt.replace(/\(.*?\)/g, "").trim())
      .filter(Boolean);

  function evaluate(input, lit, currentRecall, word) {
    const expected =
      currentRecall === "KNOWN" ? lit.trait.TRANSLATED.known : lit.trait.TRANSLATED.learning;
    if (word) return evaluateWord(input, expected);
    return evaluateSentence(input, expected, lit.trait.ANNOTATED?.tokens, currentRecall);
  }

  function evaluateWord(input, expected) {
    const match = parseAlts(expected).some((alt) => norm(input) === norm(alt));
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

  function submit() {
    if (!input.trim() || submitted) return;
    submitted = true;
    result = evaluate(input, literal, activeRecall, isWord);
    review(result);
  }

  async function next() {
    if (currentIndex + 1 < queue.length) {
      currentIndex++;
      activeRecall = recallFor(currentIndex);
      literal = queue[currentIndex];
      input = "";
      submitted = false;
      result = null;
    } else {
      buffer.release();
    }
  }

  let inputEl = $state(null);

  $effect(() => {
    if (inputEl) inputEl.focus();
  });

  function handleKey(event) {
    if (event.key === "Enter") {
      if (!submitted) submit();
      else next();
    }
  }
</script>

<ViewportLock />
<svelte:window onkeydown={handleKey} />
<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      {#if literal}
        <div class="meta">
          <span class="meta-lang">{promptLabel}</span>
          <span class="meta-type">{isWord ? "word" : "sentence"}</span>
          {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
          {#if forgiving}<span class="meta-hint">forgiving</span>{/if}
        </div>

        <p class="prompt" class:prompt-word={isWord}>{prompt}</p>

        {#if asset && activeRecall === "KNOWN"}
          <Asset {asset} />
        {/if}

        {#if isWord && promptEx}
          <p class="example">{promptEx}</p>
        {/if}

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

            {#if asset && activeRecall === "LEARNING"}
              <Asset {asset} />
            {/if}

            {#if isWord && answerEx}
              <p class="example revealed">{answerEx}</p>
            {/if}
          </div>
        {/if}
      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      <input
        class="field"
        class:field-locked={submitted}
        bind:this={inputEl}
        value={input}
        oninput={(event) => { if (!submitted) input = event.target.value; else event.target.value = input; }}
        placeholder="{answerLabel}…" />
      {#if !submitted}
        <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submit} disabled={loading || !literal}>Check</button>
      {:else}
        <button class="btn-next" onmousedown={(e) => e.preventDefault()} onclick={next} disabled={loading}>Next →</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: baseline;
  }
  .meta-lang {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
  }
  .meta-type {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--colors-skeleton-1-boundary);
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

  .example {
    font-family: var(--font-family-serif-heading);
    font-size: 0.95rem;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
    margin: 0 0 1.5rem 0;
  }
  .example.revealed {
    margin: 0.05rem 0 0 0;
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

  .controls {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
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
    min-width: 0;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, var(--colors-skeleton-app-surface));
    color: var(--colors-palette-gray-10);
    font-size: 1rem;
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }
  .field::placeholder { color: var(--colors-skeleton-1-boundary); }
  .field-locked { opacity: 0.4; pointer-events: none; }
  .btn-check {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn-check:disabled { opacity: 0.4; cursor: default; }
  .btn-next {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-next:disabled { opacity: 0.4; cursor: default; }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-xl); }
    .prompt-word { font-size: var(--font-size-2xl); }
  }
</style>

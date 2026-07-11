<script>
  import { string } from "@vivalence/typology";
  import { Asset, Desk, ViewportLock } from "@vivalence/drapes";

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
  let audioFinished = $state(false);

  let editingIndex = $state(null);
  let editValue = $state("");
  let corrections = $state(new Set());
  let editInputEl = $state(null);

  function startCorrection(i) {
    if (i === -1) {
      if (result?.signal === "SUCCESS" || corrections.has(-1)) return;
      editingIndex = -1;
      editValue = "";
      return;
    }
    const tok = result?.tokens?.[i];
    if (!tok) return;
    if (tok.signal === "SUCCESS" || corrections.has(i)) return;
    editingIndex = i;
    editValue = "";
  }

  function commitCorrection(i) {
    if (i === -1) {
      if (string.matches(editValue, answer, { forgiving })) {
        corrections.add(-1);
        corrections = new Set(corrections);
        editingIndex = null;
        editValue = "";
      } else {
        editValue = "";
      }
      return;
    }
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
    terminal.daemon.connection.call("/pick/literal/feed", { limit: 3 }).then((lits) => {
      if (lits?.length) {
        for (const l of lits) queue.push(l);
        literal = queue[0];
      }
      loading = false;
    });
  }

  const norm = forgiving ? string.fold : (s) => s.toLowerCase().trim();

  function evaluate(input, lit, currentRecall, word) {
    const expected =
      currentRecall === "KNOWN" ? lit.trait.TRANSLATED.known : lit.trait.TRANSLATED.learning;
    if (word) {
      return {
        signal: string.matches(input, expected, { forgiving }) ? "SUCCESS" : "MISTAKE",
        tokens: null,
      };
    }
    return evaluateSentence(input, expected, lit.trait.ANNOTATED?.tokens, currentRecall);
  }


  function evaluateSentence(input, expected, tokens, currentRecall) {
    const match = norm(input) === norm(expected);

    if (!tokens) {
      return { signal: match ? "SUCCESS" : "MISTAKE", tokens: null };
    }

    const remaining = norm(input).split(/\s+/);
    const key = currentRecall === "KNOWN" ? "gloss" : "form";
    const results = tokens.map((tok) => {
      const text = tok[key];
      if (!text) return { ...tok, signal: match ? "SUCCESS" : "MISTAKE" };
      const parts = norm(text).split(/\s+/);
      const found = parts.every((part) => {
        const index = remaining.indexOf(part);
        if (index === -1) return false;
        remaining.splice(index, 1);
        return true;
      });
      return { ...tok, signal: found ? "SUCCESS" : "MISTAKE" };
    });

    const correct = results.filter((tok) => tok.signal === "SUCCESS").length;
    const signal = correct === results.length ? "SUCCESS" : "MISTAKE";

    return { signal, tokens: results };
  }
  function review(result) {
    terminal.daemon.connection.call("/review/literal", {
      signal: result.signal,
      scope: { literal: literal.id },
    });

    if (result.tokens) {
      for (const tok of result.tokens) {
        if (!tok.literal) continue;
        terminal.daemon.connection.call("/review/literal", {
          signal: tok.signal,
          scope: { literal: tok.literal },
        });
      }
    }
  }

  function submit() {
    if (submitted) return;
    submitted = true;
    result = evaluate(input, literal, activeRecall, isWord);
    review(result);
  }

  function onAudioEnded() {
    audioFinished = true;
  }

  async function next() {
    if (currentIndex + 1 < queue.length) {
      currentIndex++;
      activeRecall = recallFor(currentIndex);
      literal = queue[currentIndex];
      input = "";
      submitted = false;
      result = null;
      audioFinished = false;
      corrections = new Set();
      editingIndex = null;
      editValue = "";
    } else {
      buffer.release();
    }
  }

  let inputEl = $state(null);

  $effect(() => {
    if (inputEl) inputEl.focus();
  });

  $effect(() => {
    if (editingIndex !== null && editInputEl) editInputEl.focus();
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
<Desk maxWidth="640px">
  {#snippet surface()}
    {#if literal}
      <div class="meta">
        <span class="meta-lang">{promptLabel}</span>
        <span class="meta-type">{isWord ? "word" : "sentence"}</span>
        {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
        {#if forgiving}<span class="meta-hint">forgiving</span>{/if}
        {#if asset && activeRecall === "KNOWN"}
          <div class="audio-block"><Asset {asset} /></div>
        {/if}
      </div>

      <p class="prompt" class:prompt-word={isWord}>{prompt}</p>

      {#if isWord && promptEx}
        <p class="example">{promptEx}</p>
      {/if}

      {#if submitted && result}
        <div class="divider"></div>

        <div class="feedback">
          <div class="fb-row">
            <div class="fb-left">
              <div class="fb-block">
                {#if isWord && editingIndex === -1}
                  <input
                    class="fb-input"
                    bind:this={editInputEl}
                    bind:value={editValue}
                    onkeydown={(event) => handleCorrectionKey(event, -1)}
                    onblur={() => commitCorrection(-1)}
                    placeholder={answer} />
                {:else if isWord && result.signal !== "SUCCESS" && !corrections.has(-1)}
                  <button
                    type="button"
                    class="fb-val fb-button wrong"
                    onmousedown={(event) => event.preventDefault()}
                    onclick={() => startCorrection(-1)}>
                    {input.trim() || "—"}
                  </button>
                {:else}
                  <span
                    class="fb-val"
                    class:ok={result.signal === "SUCCESS" || (isWord && corrections.has(-1))}
                    class:wrong={result.signal !== "SUCCESS" && !(isWord && corrections.has(-1))}>
                    {result.signal === "SUCCESS" || (isWord && corrections.has(-1)) ? answer : input}
                  </span>
                {/if}
              </div>

              {#if result.signal !== "SUCCESS" && !(isWord && corrections.has(-1))}
                <div class="fb-block">
                  <span class="fb-key">expected</span>
                  <span class="fb-val ok">{answer}</span>
                </div>
              {/if}

              {#if isWord && answerEx}
                <p class="example revealed">{answerEx}</p>
              {/if}
            </div>

            {#if asset && activeRecall === "LEARNING"}
              <Asset {asset} autoplay={true} onended={onAudioEnded} />
            {/if}
          </div>

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
    {:else if loading}
      <div class="loading"><span class="dot"></span></div>
    {/if}
  {/snippet}

  {#snippet controls()}
    <input
      class="field"
      bind:this={inputEl}
      value={input}
      oninput={(event) => { input = event.target.value; }}
      placeholder="{answerLabel}…" />
    {#if !submitted}
      <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submit} disabled={loading || !literal}>Check</button>
    {:else}
      <button class="btn-next" onmousedown={(e) => e.preventDefault()} onclick={next} disabled={loading}>Next →</button>
    {/if}
  {/snippet}
</Desk>

<style>
  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: baseline;
  }
  .meta-lang {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
  }
  .meta-type {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--colors-skeleton-1-boundary);
  }
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
  .prompt-word {
    font-size: var(--font-size-3xl);
  }

  .example {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
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
  .fb-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .fb-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .fb-block {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .fb-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
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
  .fb-glyph.ok {
    color: var(--colors-system-success-contrast);
    border-color: var(--colors-system-success-contrast);
  }
  .fb-glyph.wrong {
    color: var(--colors-system-error-contrast);
    border-color: var(--colors-system-error-contrast);
  }
  .fb-val {
    font-size: var(--font-size-lg);
    font-family: var(--font-family-serif-heading);
  }
  .fb-val.ok {
    color: var(--colors-system-success-contrast);
  }
  .fb-val.wrong {
    color: var(--colors-system-error-contrast);
  }
  .fb-button {
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
  .fb-input {
    font-size: var(--font-size-lg);
    font-family: var(--font-family-serif-heading);
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    color: var(--colors-system-error-contrast);
    width: 100%;
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

  .tok-ok {
    background: color-mix(in srgb, var(--colors-system-success-contrast) 12%, transparent);
  }

  .tok-miss {
    background: color-mix(in srgb, var(--colors-system-error-contrast) 12%, transparent);
  }

  .tok-form {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
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
    font-size: var(--font-size-2xs);
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
  .btn-check {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: none;
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn-check:disabled { opacity: 0.4; cursor: default; }
  .btn-next {
    min-height: 48px;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: var(--font-size-md);
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn-next:disabled { opacity: 0.4; cursor: default; }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-base); }
    .prompt-word { font-size: var(--font-size-lg); }
    .divider { margin: 0.75rem 0; }
    .feedback { gap: 0.375rem; }
    .fb-val { font-size: var(--font-size-base); }
    .tok { padding: 0.25rem 0.375rem; }
    .tok-form { font-size: var(--font-size-md); }
  }
</style>

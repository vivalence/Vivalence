<script>
  import { array, string } from "@vivalence/typology";
  import { Keyboard, Asset, ViewportLock, Desk } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  // console.log("LISTEN", { terminal, buffer });

  let keyboard;

  const data = buffer.data ?? {};
  const gameplay = data.gameplay ?? "PICK";
  const forgiving = data.forgiving ?? true;

  function recallFor(i) {
    const r = data.recall;
    if (!r) return Math.random() > 0.5 ? "KNOWN" : "LEARNING";
    if (Array.isArray(r)) return r[i] ?? (Math.random() > 0.5 ? "KNOWN" : "LEARNING");
    return r;
  }

  let literals = $state(buffer.literals ?? []);
  let loading = $state(!literals.length);
  let currentIndex = $state(0);
  let activeRecall = $state(recallFor(0));
  let answered = $state(false);
  let typed = $state("");
  let selected = $state(null);
  let shuffled = $state([]);
  let hinted = $state(false);

  let editingIndex = $state(null);
  let editValue = $state("");
  let corrections = $state(new Set());
  let editInputEl = $state(null);

  function startCorrection(i) {
    const tok = resultTokens?.[i];
    if (!tok) return;
    if (tok.signal === "SUCCESS" || corrections.has(i)) return;
    editingIndex = i;
    editValue = "";
  }

  function commitCorrection(i) {
    const tok = resultTokens?.[i];
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

  const target = $derived(
    data.target
      ? literals.find((l) => l.id === data.target)
      : literals[currentIndex] ?? literals[0],
  );
  const isWord = $derived(target?.symbol?.word);
  const asset = $derived(terminal.daemon.getAsset(target?.trait?.VOCALIZED?.asset));
  const total = $derived(gameplay === "TYPE" ? literals.length : 1);
  const position = $derived(currentIndex + 1);

  const answer = $derived(
    target &&
      (activeRecall === "KNOWN"
        ? target.trait?.TRANSLATED?.known
        : target.trait?.TRANSLATED?.learning),
  );
  const answerLabel = $derived(activeRecall === "KNOWN" ? "English" : "Português");
  const hint = $derived(
    target &&
      (activeRecall === "KNOWN"
        ? target.trait?.TRANSLATED?.learning
        : target.trait?.TRANSLATED?.known),
  );
  const example = $derived(target?.trait?.EXEMPLIFIED);
  const learningExample = $derived(example?.learning);
  const knownExample = $derived(example?.known);
  const hintExample = $derived(activeRecall === "KNOWN" ? learningExample : knownExample);
  const learningValue = $derived(target?.trait?.TRANSLATED?.learning);
  const knownValue = $derived(target?.trait?.TRANSLATED?.known);

  function answerText(lit) {
    return activeRecall === "KNOWN"
      ? lit?.trait?.TRANSLATED?.known
      : lit?.trait?.TRANSLATED?.learning;
  }

  if (!literals.length) {
    terminal.daemon
      .call("/pick/literal/feed", { limit: 4 })
      .then((lits) => {
        literals = lits ?? [];
        shuffled = array.shuffle(literals);
        loading = false;
      })
      .catch((e) => {
        loading = false;
      });
  } else {
    shuffled = array.shuffle(literals);
  }

  const normalize = (text) =>
    forgiving ? string.fold(text) : text.toLowerCase().trim();

  function evaluateTyped() {
    if (!answer) return false;
    return string.matches(typed, answer, { forgiving }) ? "correct" : "wrong";
  }

  function submitType() {
    if (answered) return;
    answered = true;

    const result = evaluateTyped();
    const signal = result === "correct" ? "SUCCESS" : "MISTAKE";

    terminal.daemon.call("/review/literal", {
      signal,
      scope: { literal: target.id },
    });
  }

  function selectPick(lit) {
    if (answered) return;
    selected = lit;
    answered = true;

    const isCorrect =
      lit === target || lit?.id === target?.id || answerText(lit) === answerText(target);

    terminal.daemon.call("/review/literal", {
      signal: isCorrect ? "SUCCESS" : "MISTAKE",
      scope: { literal: target.id },
    });

    if (!isCorrect) {
      terminal.daemon.call("/review/literal", {
        signal: "MISTAKE",
        scope: { literal: lit.id },
      });
    }

    setTimeout(() => advance(), isCorrect ? 800 : 1200);
  }

  function advance() {
    if (gameplay === "TYPE" && currentIndex + 1 < literals.length) {
      currentIndex++;
      activeRecall = recallFor(currentIndex);
      typed = "";
      answered = false;
      hinted = false;
      corrections = new Set();
      editingIndex = null;
      editValue = "";
    } else {
      buffer.release();
    }
  }

  const pickCorrect = $derived(
    selected &&
      (selected === target ||
        selected?.id === target?.id ||
        answerText(selected) === answerText(target)),
  );
  const typeResult = $derived(answered && gameplay === "TYPE" ? evaluateTyped() : null);
  const answerExample = $derived(activeRecall === "KNOWN" ? knownExample : learningExample);
  const answerReveal = $derived(isWord ? answerExample : hint);
  const resultTokens = $derived.by(() => {
    if (!answered || gameplay !== "TYPE" || isWord) return null;
    const tokens = target?.trait?.ANNOTATED?.tokens;
    if (!tokens) return null;
    const key = activeRecall === "KNOWN" ? "gloss" : "form";
    const remaining = normalize(typed).split(/\s+/);
    return tokens.map((tok) => {
      const text = tok[key];
      if (!text) return { ...tok, signal: typeResult === "correct" ? "SUCCESS" : "MISTAKE" };
      const parts = normalize(text).split(/\s+/);
      const found = parts.every((part) => {
        const index = remaining.indexOf(part);
        if (index === -1) return false;
        remaining.splice(index, 1);
        return true;
      });
      return { ...tok, signal: found ? "SUCCESS" : "MISTAKE" };
    });
  });

  let inputEl = $state(null);

  $effect(() => {
    if (gameplay === "TYPE" && !answered && inputEl) inputEl.focus();
    else if (gameplay === "TYPE" && answered && keyboard) keyboard.focus();
  });

  $effect(() => {
    if (editingIndex !== null && editInputEl) editInputEl.focus();
  });

  function handleKey(event) {
    if (gameplay === "TYPE") {
      if (event.target === inputEl || event.target === editInputEl) return;
      if (["Enter", "Space"].includes(event.key) && !answered) {
        event.preventDefault();
        submitType();
      } else if (["Enter", "Space"].includes(event.key) && answered) {
        event.preventDefault();
        advance();
      } else if (event.key === "h") {
        event.preventDefault();
        hinted = !hinted;
      }
      return;
    }

    if (event.target.closest("input,textarea")) return;

    if (event.key === "h") {
      event.preventDefault();
      hinted = !hinted;
      return;
    }

    if (answered && ["Enter", "Space"].includes(event.key)) {
      event.preventDefault();
      advance();
      return;
    }

    const n = parseInt(event.key);
    if (n >= 1 && n <= shuffled.length && !answered) {
      event.preventDefault();
      selectPick(shuffled[n - 1]);
    }
  }
</script>

{#if gameplay === "TYPE"}<Keyboard bind:this={keyboard} />{/if}
<ViewportLock />
<svelte:window onkeydown={handleKey} />

<Desk>
  {#snippet surface()}
    {#if target}
      <div class="meta">
        <span class="meta-lang">Listen</span>
        <span class="meta-type">{isWord ? "word" : "sentence"}</span>
        {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
        {#if !answered}
          <div class="audio-block">
            {#if asset}
              <Asset autoplay={true} {asset} />
            {:else}
              <span class="no-audio">no audio available</span>
            {/if}
          </div>
        {/if}
      </div>

      {#if !answered}
        {#if hint}
          <button class="hint-toggle" onclick={() => (hinted = !hinted)}>
            {#if hinted}
              <span class="hint-term">{hint}</span>
              {#if hintExample}<span class="hint-example">{hintExample}</span>{/if}
            {:else}
              <span class="hint-label">?</span>
            {/if}
          </button>
        {/if}
      {/if}

      {#if gameplay === "TYPE"}
        {#if answered}
          <div class="divider"></div>
          <div class="feedback">
            <div class="fb-row">
              <div class="fb-left">
                <div class="fb-block">
                  <span
                    class="fb-val"
                    class:ok={typeResult === "correct"}
                    class:wrong={typeResult === "wrong"}
                    class:word={isWord}>
                    {typeResult === "correct" ? answer : typed}
                  </span>
                </div>

                {#if typeResult === "wrong"}
                  <div class="fb-block">
                    <span class="fb-key">expected</span>
                    <span class="fb-val ok" class:word={isWord}>{answer}</span>
                  </div>
                {/if}

                {#if answerReveal}
                  <p class="example revealed" class:word={isWord}>{answerReveal}</p>
                {/if}

                {#if isWord && hint}
                  <div class="fb-block hint-block">
                    <span class="fb-val hint">{hint}</span>
                  </div>
                  {#if hintExample}
                    <p class="example revealed target">{hintExample}</p>
                  {/if}
                {/if}
              </div>

              {#if asset}
                <Asset {asset} />
              {/if}
            </div>

            {#if resultTokens}
              <div class="tokens">
                {#each resultTokens as tok, i}
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
      {:else}
        <div class="pick-area">
          <p class="pick-hint">{answerLabel}</p>
          <div class="options">
            {#each shuffled as lit, i}
              {@const isThis = selected === lit || selected?.id === lit?.id}
              {@const isAnswer =
                lit === target ||
                lit?.id === target?.id ||
                answerText(lit) === answerText(target)}
              <button
                class="option"
                class:option-correct={answered && isAnswer}
                class:option-wrong={answered && isThis && !isAnswer}
                class:option-dimmed={answered && !isThis && !isAnswer}
                ontouchstart={(e) => e.preventDefault()}
                onclick={() => selectPick(lit)}
                disabled={answered}>
                <span class="option-key">{i + 1}</span>
                <span class="option-text">{answerText(lit)}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {:else if loading}
      <div class="loading"><span class="dot"></span></div>
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if loading}
      <span class="menu-hint">loading…</span>
    {:else if gameplay === "TYPE"}
      {#if !answered}
        <input
          class="field"
          bind:this={inputEl}
          value={typed}
          oninput={(e) => { typed = e.target.value; }}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              submitType();
            }
          }}
          placeholder="{answerLabel}…" />
        <button
          class="btn-check"
          onmousedown={(e) => e.preventDefault()}
          ontouchstart={(e) => e.preventDefault()}
          onclick={submitType}>Check</button>
      {:else}
        <span
          class="fb-glyph"
          class:ok={typeResult === "correct"}
          class:wrong={typeResult === "wrong"}>
          {typeResult === "correct" ? "✓" : "✗"}
        </span>
        <button
          class="btn btn-next"
          onmousedown={(e) => e.preventDefault()}
          ontouchstart={(e) => e.preventDefault()}
          onclick={advance}>Next</button>
      {/if}
    {:else if answered}
      <button
        class="btn btn-next"
        onmousedown={(e) => e.preventDefault()}
        ontouchstart={(e) => e.preventDefault()}
        onclick={advance}>Next</button>
    {:else}
      <span class="menu-hint">pick the {answerLabel}</span>
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

  .audio-block {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .hint-toggle {
    align-self: flex-start;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    background: none;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.375rem;
    min-height: 44px;
    padding: 0.625rem 0.875rem;
    margin-bottom: 1.5rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }
  .hint-toggle:hover {
    opacity: 1;
  }
  .hint-label {
    font-family: var(--font-family-code);
    font-size: 0.85rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .hint-term {
    font-family: var(--font-family-serif-heading);
    font-size: 1.05rem;
    line-height: 1.35;
    color: var(--colors-palette-gray-100);
  }
  .hint-example {
    font-family: var(--font-family-serif-heading);
    font-size: 0.9rem;
    line-height: 1.35;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
  }
  .no-audio {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
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
    min-width: 0;
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
    font-size: 0.6rem;
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
    font-size: 1.25rem;
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
    font-size: 1.25rem;
    font-family: var(--font-family-serif-heading);
  }
  .fb-val.ok {
    color: var(--colors-system-success-contrast);
  }
  .fb-val.wrong {
    color: var(--colors-system-error-contrast);
  }
  .fb-val.hint {
    color: var(--colors-skeleton-1-contrast);
    font-size: 1.5rem;
    opacity: 1;
  }
  .fb-val.word {
    font-size: 1.5rem;
  }
  .hint-block {
    margin-top: 0.75rem;
  }

  .example {
    font-family: var(--font-family-serif-heading);
    font-size: 1rem;
    line-height: 1.4;
    color: var(--colors-skeleton-1-contrast);
    opacity: 0.7;
    font-style: italic;
    margin: 0;
  }
  .example.revealed {
    margin: 0.05rem 0 0 0;
  }
  .example.word {
    font-size: 1.05rem;
  }
  .example.target {
    font-size: 1.05rem;
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
    font-size: 1rem;
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

  @media (max-width: 640px) {
    .feedback { gap: 0.375rem; }
    .fb-val { font-size: 1rem; }
    .fb-val.hint { font-size: 1.25rem; }
    .fb-val.word { font-size: 1.25rem; }
    .tok { padding: 0.25rem 0.375rem; }
    .tok-form { font-size: 0.85rem; }
  }

  .pick-area {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .pick-hint {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 48px;
    padding: 0.875rem 1.125rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(
      in srgb,
      var(--colors-skeleton-1-surface) 70%,
      var(--colors-skeleton-2-surface)
    );
    color: var(--colors-palette-gray-100);
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;
  }
  .option:hover:not(:disabled) {
    border-color: var(--colors-skeleton-1-contrast);
  }

  .option-key {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
    width: 1rem;
    flex-shrink: 0;
  }
  .option-text {
    font-size: var(--font-size-base);
    font-family: var(--font-family-serif-heading);
    line-height: 1.35;
  }

  .option-correct {
    background: color-mix(in srgb, var(--colors-system-success-surface) 80%, transparent);
    border-color: var(--colors-system-success-contrast);
    color: var(--colors-system-success-contrast);
  }
  .option-wrong {
    background: color-mix(in srgb, var(--colors-system-error-surface) 80%, transparent);
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }
  .option-dimmed {
    opacity: 0.35;
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
    font-size: 1rem;
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
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .menu-hint {
    display: block;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  .btn {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-next {
    background: transparent;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-palette-gray-200);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .type-input { font-size: var(--font-size-lg); font-family: var(--font-family-sans-text); }
    .option-text { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); }
  }
</style>

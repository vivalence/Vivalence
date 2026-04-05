<script>
  import { string, array } from "@vivalence/typology";
  import { Keyboard, Asset, ViewportLock, Desk } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

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

  const target = $derived(data.target ? literals.find((l) => l.id === data.target) : literals[0]);
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

  function normalize(text) {
    if (!forgiving) return text.trim();
    return text
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function evaluateTyped() {
    if (!answer) return false;
    const alts = answer.split("/").map((s) => s.trim()).filter(Boolean);
    const got = normalize(typed);

    // exact match on any single alt
    if (alts.some((alt) => got === normalize(alt))) return "correct";

    // all alts combined, word-order agnostic ("next nearby" for "next / nearby")
    if (alts.length > 1) {
      const inputWords = new Set(got.split(/\s+/));
      const altWords = new Set(alts.flatMap((alt) => normalize(alt).split(/\s+/)));
      if (inputWords.size === altWords.size && [...altWords].every((w) => inputWords.has(w))) return "correct";
    }

    // close match on any alt
    if (alts.some((alt) => {
      const similarity = string.levenshtein(got, normalize(alt));
      return similarity <= 2 && got.length > 3;
    })) return "close";

    return "wrong";
  }

  function submitType() {
    if (answered) return;
    answered = true;

    const result = evaluateTyped();
    const signal = result === "correct" ? "SUCCESS" : result === "close" ? "NEUTRAL" : "MISTAKE";

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

  let inputEl = $state(null);

  $effect(() => {
    if (gameplay === "TYPE" && !answered && inputEl) inputEl.focus();
    else if (gameplay === "TYPE" && answered && keyboard) keyboard.focus();
  });

  function handleKey(event) {
    if (gameplay === "TYPE") {
      if (["Enter", "Space"].includes(event.key) && !answered) {
        event.preventDefault();
        submitType();
      } else if (["Enter", "Space"].includes(event.key) && answered) {
        event.preventDefault();
        advance();
      } else if (event.key === "h" && !event.target.closest("input")) {
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
      </div>

      <div class="audio-row">
        <div class="audio-block">
          {#if asset}
            <Asset autoplay={true} {asset} />
          {:else}
            <span class="no-audio">no audio available</span>
          {/if}
        </div>
        <button class="hint-toggle" onclick={() => (hinted = !hinted)}>
          {#if hinted}<span class="hint-text">{hint}</span>{:else}<span class="hint-label">?</span>{/if}
        </button>
      </div>

      {#if gameplay === "TYPE"}
        {#if answered}
          <div class="type-feedback">
            {#if typeResult === "correct"}
              <span class="fb-correct">Correct</span>
            {:else if typeResult === "close"}
              <span class="fb-close">Close — {answer}</span>
            {:else}
              <span class="fb-wrong">{answer}</span>
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
      <input
        class="field"
        class:field-locked={answered}
        bind:this={inputEl}
        value={typed}
        oninput={(e) => { if (!answered) typed = e.target.value; else e.target.value = typed; }}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            if (!answered) submitType();
            else advance();
          }
        }}
        placeholder="{answerLabel}…" />
      {#if !answered}
        <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submitType}>Check</button>
      {:else}
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>Next</button>
      {/if}
    {:else if answered}
      <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>Next</button>
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

  .audio-row {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }
  .audio-block {
    display: flex;
    justify-content: center;
  }
  .hint-toggle {
    position: absolute;
    right: 0;
    background: none;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.375rem;
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hint-toggle:hover {
    opacity: 1;
  }
  .hint-label {
    font-family: var(--font-family-code);
    font-size: 0.85rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .hint-text {
    font-family: var(--font-family-serif-heading);
    font-size: 0.85rem;
    color: var(--colors-palette-gray-100);
  }
  .no-audio {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .type-feedback {
    margin-top: 0.5rem;
  }
  .fb-correct {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-system-success-contrast);
  }
  .fb-close {
    font-family: var(--font-family-serif-heading);
    font-size: 0.9rem;
    color: var(--colors-system-warning-contrast, #c90);
  }
  .fb-wrong {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-theme-primary-contrast);
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

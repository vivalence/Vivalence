<script>
  import { Keyboard, Asset } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const gameplay = data.gameplay ?? "pick";
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

  const target = $derived(gameplay === "type" ? literals[currentIndex] : literals[0]);
  const isWord = $derived(target?.symbol?.word);
  const asset = $derived(terminal.daemon.getAsset(target?.trait?.VOCALIZED?.asset));
  const total = $derived(gameplay === "type" ? literals.length : 1);
  const position = $derived(currentIndex + 1);

  const answer = $derived(
    target && (activeRecall === "LEARNING"
      ? target.trait?.TRANSLATED?.known
      : target.trait?.TRANSLATED?.learning),
  );
  const answerLabel = $derived(activeRecall === "LEARNING" ? "English" : "Português");

  function answerText(lit) {
    return activeRecall === "LEARNING"
      ? lit?.trait?.TRANSLATED?.known
      : lit?.trait?.TRANSLATED?.learning;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  if (!literals.length) {
    terminal.daemon.call("/pick/literal/feed", { take: 4 }).then((lits) => {
      literals = lits ?? [];
      shuffled = shuffle(literals);
      loading = false;
    });
  } else {
    shuffled = shuffle(literals);
  }

  function normalize(text) {
    if (!forgiving) return text.trim();
    return text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function evaluateTyped() {
    if (!answer) return false;
    const expected = normalize(answer);
    const got = normalize(typed);
    if (got === expected) return "correct";
    const similarity = levenshtein(got, expected);
    if (similarity <= 2 && got.length > 3) return "close";
    return "wrong";
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  function submitType() {
    if (answered) return;
    answered = true;

    const result = evaluateTyped();
    const signal = result === "correct" ? "SUCCESS" : result === "close" ? "MISTAKE" : "FAILURE";

    terminal.daemon.call("/review/literal", {
      signal,
      scope: { literal: target.id },
    });
  }

  function selectPick(lit) {
    if (answered) return;
    selected = lit;
    answered = true;

    const isCorrect = lit === target || lit?.id === target?.id;

    terminal.daemon.call("/review/literal", {
      signal: isCorrect ? "SUCCESS" : "FAILURE",
      scope: { literal: target.id },
    });

    if (!isCorrect) {
      terminal.daemon.call("/review/literal", {
        signal: "FAILURE",
        scope: { literal: lit.id },
      });
    }
  }

  function advance() {
    if (gameplay === "type" && currentIndex + 1 < literals.length) {
      currentIndex++;
      activeRecall = recallFor(currentIndex);
      typed = "";
      answered = false;
    } else {
      buffer.release();
    }
  }

  const pickCorrect = $derived(
    selected && (selected === target || selected?.id === target?.id),
  );
  const typeResult = $derived(answered && gameplay === "type" ? evaluateTyped() : null);

  function handleKey(event) {
    if (gameplay === "type") {
      if (event.key === "Enter" && !answered) {
        event.preventDefault();
        submitType();
      } else if (event.key === "Enter" && answered) {
        event.preventDefault();
        advance();
      } else if (event.key === "r" && !event.target.closest("input")) {
        event.preventDefault();
      }
      return;
    }

    if (event.target.closest("input,textarea")) return;

    if (answered && event.key === "Enter") {
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

<Keyboard bind:this={keyboard} />
<svelte:window onkeydown={handleKey} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">
      {#if target}
        <div class="meta">
          <span class="meta-lang">Listen</span>
          <span class="meta-type">{isWord ? "word" : "sentence"}</span>
          {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
        </div>

        <div class="audio-block">
          {#if asset}
            <Asset autoplay={true} {asset} />
          {:else}
            <span class="no-audio">no audio available</span>
          {/if}
        </div>

        {#if gameplay === "type"}
          <div class="type-area">
            <label class="input-label">{answerLabel}</label>
            <input
              class="type-input"
              class:input-correct={typeResult === "correct"}
              class:input-close={typeResult === "close"}
              class:input-wrong={typeResult === "wrong"}
              type="text"
              bind:value={typed}
              disabled={answered}
              autofocus
              placeholder="type your answer…"
            />
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
          </div>
        {:else}
          <div class="pick-area">
            <p class="pick-hint">{answerLabel}</p>
            <div class="options">
              {#each shuffled as lit, i}
                {@const isThis = selected === lit || selected?.id === lit?.id}
                {@const isAnswer = lit === target || lit?.id === target?.id}
                <button
                  class="option"
                  class:option-correct={answered && isAnswer}
                  class:option-wrong={answered && isThis && !isAnswer}
                  class:option-dimmed={answered && !isThis && !isAnswer}
                  ontouchstart={(e) => keyboard.guard(e)}
                  onclick={() => selectPick(lit)}
                  disabled={answered}
                >
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
    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="input-row">
      {#if loading}
        <span class="menu-hint">loading…</span>
      {:else if answered}
        <button class="btn btn-next" ontouchstart={(e) => keyboard.guard(e)} onclick={advance}>
          Next
        </button>
      {:else if gameplay === "type"}
        <button class="btn btn-submit" ontouchstart={(e) => keyboard.guard(e)} onclick={submitType}>
          Check
        </button>
      {:else}
        <span class="menu-hint">pick the {answerLabel}</span>
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
    padding: 12vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
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

  .audio-block {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }
  .no-audio {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .type-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-label {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .type-input {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-10);
    background: none;
    border: none;
    border-bottom: 2px solid var(--colors-skeleton-1-boundary);
    outline: none;
    padding: 0.5rem 0;
    width: 100%;
  }
  .type-input:focus { border-color: var(--colors-theme-primary-contrast); }
  .input-correct { border-color: var(--colors-system-success-contrast); color: var(--colors-system-success-contrast); }
  .input-close { border-color: var(--colors-system-warning-contrast, #c90); color: var(--colors-system-warning-contrast, #c90); }
  .input-wrong { border-color: var(--colors-system-error-contrast); color: var(--colors-system-error-contrast); }

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
    padding: 0.875rem 1.125rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--colors-palette-gray-100);
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;
  }
  .option:hover:not(:disabled) { border-color: var(--colors-skeleton-1-contrast); }

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
  .option-dimmed { opacity: 0.35; }

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
    padding: 1rem;
    border-radius: 0.625rem;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-submit {
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .btn-next {
    background: transparent;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-palette-gray-200);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .stage { padding-top: 6vh; padding-left: 1rem; padding-right: 1rem; }
    .audio-block { margin-bottom: 1.5rem; }
    .type-input { font-size: var(--font-size-lg); font-family: var(--font-family-sans-text); }
    .option { padding: 1rem 1rem; }
    .option-text { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); }
    .btn { padding: 1.125rem; font-size: 1rem; }
    .menu { padding: 1.25rem 1rem calc(1.25rem + env(safe-area-inset-bottom, 0px)); }
    .menu-hint { padding: 0.75rem; font-size: 0.85rem; }
  }
</style>

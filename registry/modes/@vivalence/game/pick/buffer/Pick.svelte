<script>
  import { Asset } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const recall = data.recall ?? "LEARNING";

  let literals = $state(buffer.literals ?? []);
  let loading = $state(!literals.length);
  let selected = $state(null);
  let shuffled = $state([]);

  const target = $derived(literals[0]);
  const isWord = $derived(target?.symbol?.word);
  const asset = $derived(terminal.daemon.getAsset(target?.trait?.VOCALIZED?.asset));

  const prompt = $derived(
    target && (recall === "KNOWN"
      ? target.trait?.TRANSLATED?.learning
      : target.trait?.TRANSLATED?.known),
  );
  const promptLabel = $derived(recall === "KNOWN" ? "Português" : "English");
  const answerLabel = $derived(recall === "KNOWN" ? "English" : "Português");

  function answerText(lit) {
    return recall === "KNOWN"
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
    terminal.daemon.call("/pick/literal/feed", { limit: 4 }).then((lits) => {
      literals = lits ?? [];
      shuffled = shuffle(literals);
      loading = false;
    });
  } else {
    shuffled = shuffle(literals);
  }

  function select(lit) {
    if (selected !== null) return;
    selected = lit;

    const isCorrect = lit === target || lit?.id === target?.id;

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
  }

  function advance() {
    buffer.release();
  }

  const isCorrect = $derived(
    selected && (selected === target || selected?.id === target?.id),
  );
  const answered = $derived(selected !== null);

  function handleKey(event) {
    if (event.target.closest("input,textarea")) return;
    if (answered && event.key === "Enter") {
      event.preventDefault();
      advance();
      return;
    }
    const n = parseInt(event.key);
    if (n >= 1 && n <= shuffled.length && !answered) {
      event.preventDefault();
      select(shuffled[n - 1]);
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      {#if target}
        <div class="meta">
          <span class="meta-lang">{promptLabel}</span>
          <span class="meta-type">{isWord ? "word" : "sentence"}</span>
        </div>

        <div class="prompt-row">
          <p class="prompt" class:prompt-word={isWord}>{prompt}</p>
          {#if asset && recall === "KNOWN"}
            <Asset autoplay={true} {asset} />
          {/if}
        </div>

        <div class="options">
          {#each shuffled as lit, i}
            {@const isThis = selected === lit || selected?.id === lit?.id}
            {@const isAnswer = lit === target || lit?.id === target?.id}
            <button
              class="option"
              class:option-correct={answered && isAnswer}
              class:option-wrong={answered && isThis && !isAnswer}
              class:option-dimmed={answered && !isThis && !isAnswer}
              onmousedown={(e) => e.preventDefault()}
              onclick={() => select(lit)}
              disabled={answered}
            >
              <span class="option-key">{i + 1}</span>
              <span class="option-text">{answerText(lit)}</span>
            </button>
          {/each}
        </div>

      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      {#if loading}
        <span class="menu-hint">loading…</span>
      {:else if answered}
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
          Next
        </button>
      {:else}
        <span class="menu-hint">pick the {answerLabel} translation</span>
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
    margin-bottom: 0.75rem;
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

  .prompt-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.35;
    margin: 0;
    flex: 1;
    letter-spacing: -0.01em;
  }
  .prompt-word {
    font-size: var(--font-size-2xl);
    line-height: 1.2;
    letter-spacing: -0.02em;
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

  .controls {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
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
  .btn-next {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-lg); }
    .prompt-word { font-size: var(--font-size-xl); }
    .option-text { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); }
  }
</style>

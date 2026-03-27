<script>
  import { Asset } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

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
  let revealed = $state(false);

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

  function reveal() {
    revealed = true;
  }

  function review(literal, signal) {
    const scope = { literal: literal.id };
    terminal.daemon.call("/review/literal", { signal, scope });
  }

  async function rate(signal) {
    review(literal, signal);
    if (currentIndex + 1 < queue.length) {
      currentIndex++;
      literal = queue[currentIndex];
      activeRecall = recallFor(currentIndex);
      revealed = false;
    } else {
      buffer.release();
    }
  }

  function handleKey(event) {
    if (event.target.closest("input,textarea")) return;
    if (event.key === " ") {
      event.preventDefault();
      if (!revealed) reveal();
    }
    if (revealed) {
      if (event.key === "1") rate("MISTAKE");
      if (event.key === "2") rate("SUCCESS");
      if (event.key === "3") rate("MASTERY");
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      {#if literal}
        <div class="meta">
          <span class="meta-lang">{promptLabel}</span>
          <span class="meta-type">{isWord ? "word" : "sentence"}</span>
          {#if total > 1}<span class="meta-type">{position}/{total}</span>{/if}
        </div>

        <div class="prompt-row">
          <div class="prompt-text">
            <p class="prompt" class:prompt-word={isWord}>{prompt}</p>
            {#if isWord && promptEx}
              <p class="example">{promptEx}</p>
            {/if}
          </div>
          {#if asset && activeRecall === "KNOWN"}
            <Asset autoplay={true} {asset} />
          {/if}
        </div>

        {#if revealed}
          <div class="divider"></div>

          <div class="reveal-block">
            <span class="reveal-label">{answerLabel}</span>
            <div class="prompt-row">
              <div class="prompt-text">
                <p class="answer" class:answer-word={isWord}>{answer}</p>
                {#if isWord && answerEx}
                  <p class="example revealed">{answerEx}</p>
                {/if}
              </div>
              {#if asset && activeRecall === "LEARNING"}
                <Asset autoplay={true} {asset} />
              {/if}
            </div>
          </div>
        {:else}
          <button class="tap-zone" onmousedown={(e) => e.preventDefault()} onclick={reveal}
            >tap to reveal</button>
        {/if}
      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      {#if loading}
        <span class="menu-hint">loading...</span>
      {:else if revealed}
        <button
          class="btn btn-unknown"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => rate("MISTAKE")}>Unknown</button>
        <button
          class="btn btn-known"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => rate("SUCCESS")}>Known</button>
        <button
          class="btn btn-easy"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => rate("MASTERY")}>Easy</button>
      {:else}
        <button class="btn btn-reveal" onmousedown={(e) => e.preventDefault()} onclick={reveal}
          >Reveal</button>
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

  .prompt-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  .prompt-text {
    flex: 1;
    min-width: 0;
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
    margin: 0.75rem 0 0 0;
  }

  .tap-zone {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    background: none;
    border: none;
    padding: 1rem;
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
    cursor: pointer;
    width: 100%;
  }

  .divider {
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin: 1.5rem 0;
  }

  .reveal-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .reveal-label {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .answer {
    font-family: var(--font-family-serif-heading);
    font-size: 1.25rem;
    color: var(--colors-theme-primary-contrast);
    margin: 0;
    line-height: 1.2;
  }
  .answer-word {
    font-size: var(--font-size-2xl);
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
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .controls {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
  }
  .input-row {
    max-width: 480px;
    margin: 0 auto;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.625rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.75rem;
    font-family: var(--font-family-code);
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn {
    flex: 1;
    min-height: 48px;
    padding: 0.75rem 0.5rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-unknown {
    background: var(--colors-system-error-surface);
    color: var(--colors-system-error-contrast);
  }
  .btn-known {
    background: var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
  }
  .btn-easy {
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .btn-reveal {
    background: transparent;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-1-contrast);
  }

  @media (max-width: 640px) {
    .prompt { font-size: var(--font-size-xl); }
    .prompt-word { font-size: var(--font-size-2xl); }
  }
</style>

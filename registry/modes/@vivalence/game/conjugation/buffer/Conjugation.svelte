<script>
  import { Asset, ViewportLock } from "@vivalence/drapes";
  import { string } from "@vivalence/typology";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const literals = buffer.literals ?? [];
  const symbols = buffer.symbols ?? [];
  const recall = data.recall ?? "LEARNING";

  function findLiteral(id) {
    return id ? literals.find((l) => l.id === id) : null;
  }
  function findSymbol(id) {
    return id ? symbols.find((s) => s.id === id) : null;
  }

  const target = findLiteral(data.target);
  const infinitive = findLiteral(data.infinitive);
  const tenseSymbol = findSymbol(data.tense);
  const moodSymbol = findSymbol(data.mood);

  const tenseLabel = tenseSymbol?.trait?.LABELED?.name ?? "";
  const moodLabel = moodSymbol?.trait?.LABELED?.name ?? "";
  const headerLabel = [tenseLabel, moodLabel].filter(Boolean).join(" · ") || "conjugation";

  const infinitiveText = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const infinitiveKnown = infinitive?.trait?.TRANSLATED?.known ?? "";
  const infinitiveAsset = infinitive?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(infinitive.trait.VOCALIZED.asset)
    : null;

  const targetAsset = target?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(target.trait.VOCALIZED.asset)
    : null;

  // Derive person label from target's symbols
  function personLabel(lit) {
    const syms = lit?.symbol ?? {};
    if (syms["word.person.first"] && syms["word.number.singular"]) return "eu";
    if (syms["word.person.second"] && syms["word.number.singular"]) return "tu/você";
    if (syms["word.person.third"] && syms["word.number.singular"]) return "ele/ela";
    if (syms["word.person.first"] && syms["word.number.plural"]) return "nós";
    if (syms["word.person.second"] && syms["word.number.plural"]) return "vós";
    if (syms["word.person.third"] && syms["word.number.plural"]) return "eles/elas";
    return "";
  }

  const person = personLabel(target);

  // Recall direction
  const prompt = recall === "KNOWN"
    ? target?.trait?.TRANSLATED?.learning
    : target?.trait?.TRANSLATED?.known;
  const answer = recall === "KNOWN"
    ? target?.trait?.TRANSLATED?.known
    : target?.trait?.TRANSLATED?.learning;

  let input = $state("");
  let submitted = $state(false);
  let correct = $state(false);
  let inputEl = $state(null);

  $effect(() => {
    if (inputEl && !submitted) inputEl.focus();
  });

  function evaluate(text) {
    const alts = string.separate(answer);
    return alts.some((alt) => string.fold(text) === string.fold(alt));
  }

  function submit() {
    if (!input.trim() || submitted) return;
    submitted = true;
    correct = evaluate(input);

    terminal.daemon.call("/review/literal", {
      signal: correct ? "SUCCESS" : "MISTAKE",
      scope: { literal: target.id },
    });
  }

  function advance() {
    buffer.release();
  }

  function handleKey(event) {
    if (event.target.closest("textarea")) return;
    if (event.key === "Enter") {
      event.preventDefault();
      if (!submitted) submit();
      else advance();
    }
  }
</script>

<ViewportLock />
<svelte:window onkeydown={handleKey} />

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      <div class="meta">
        <span class="meta-lang">Conjugation</span>
      </div>

      <div class="header">
        <div class="header-text">
          <h2 class="infinitive">{infinitiveText}</h2>
          <p class="header-known">{infinitiveKnown}</p>
          <p class="tense-label">{headerLabel}</p>
        </div>
        {#if infinitiveAsset}
          <Asset asset={infinitiveAsset} variant="dot" />
        {/if}
      </div>

      <div class="card">
        <span class="person">{person}</span>

        {#if recall === "LEARNING" && prompt}
          <p class="prompt">{prompt}</p>
        {/if}

        {#if submitted}
          <div class="feedback">
            <div class="fb-line" class:fb-ok={correct} class:fb-miss={!correct}>
              <span class="fb-icon">{correct ? "✓" : "✗"}</span>
              <span class="fb-input">{input}</span>
            </div>
            {#if !correct}
              <div class="fb-answer">
                <span class="fb-answer-label">expected</span>
                <span class="fb-answer-text">{answer}</span>
              </div>
            {/if}
            {#if targetAsset}
              <div class="fb-audio">
                <Asset asset={targetAsset} variant="dot" autoplay={correct} />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      {#if submitted}
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
          Next
        </button>
      {:else}
        <input
          class="field"
          bind:this={inputEl}
          value={input}
          oninput={(e) => { input = e.target.value; }}
          placeholder="type the form…"
        />
        <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submit}>
          Check
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem 1.25rem;
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

  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .header-text { flex: 1; }
  .infinitive {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0;
  }
  .header-known {
    font-family: var(--font-family-serif-heading);
    font-size: 0.85rem;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
    margin: 0.25rem 0 0 0;
  }
  .tense-label {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
    margin: 0.375rem 0 0 0;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 60%, transparent);
  }

  .person {
    font-family: var(--font-family-code);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--colors-theme-primary-contrast);
    letter-spacing: 0.04em;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: 0.9rem;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
    margin: 0;
  }

  .feedback {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .fb-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .fb-icon {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1;
  }
  .fb-input {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    line-height: 1.3;
  }
  .fb-ok .fb-icon, .fb-ok .fb-input { color: var(--colors-system-success-contrast); }
  .fb-miss .fb-icon, .fb-miss .fb-input { color: var(--colors-system-error-contrast); }

  .fb-answer {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .fb-answer-label {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .fb-answer-text {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-theme-primary-contrast);
  }

  .fb-audio { margin-top: 0.25rem; }

  /* ── controls ── */
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

  .btn-next {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  @media (max-width: 640px) {
    .infinitive { font-size: var(--font-size-xl); }
    .fb-input, .fb-answer-text { font-family: var(--font-family-sans-text); }
  }
</style>

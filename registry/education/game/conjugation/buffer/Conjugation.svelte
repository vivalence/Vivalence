<script>
  import { Asset, Keyboard, ViewportLock, Desk } from "@vivalence/drapes";
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

  const infinitiveText = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const infinitiveKnown = infinitive?.trait?.TRANSLATED?.known ?? "";
  const infinitiveAsset = infinitive?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(infinitive.trait.VOCALIZED.asset)
    : null;

  const tenseLabel = tenseSymbol?.trait?.LABELED?.name ?? tenseSymbol?.slug?.split(".")?.pop() ?? "";
  const moodLabel = moodSymbol?.trait?.LABELED?.name ?? moodSymbol?.slug?.split(".")?.pop() ?? "";
  const headerLabel = [infinitiveKnown, tenseLabel, moodLabel].filter(Boolean).join(" · ");

  const targetAsset = target?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(target.trait.VOCALIZED.asset)
    : null;

  // Recall direction
  const prompt = recall === "KNOWN"
    ? target?.trait?.TRANSLATED?.learning
    : target?.trait?.TRANSLATED?.known;
  const answer = recall === "KNOWN"
    ? target?.trait?.TRANSLATED?.known
    : target?.trait?.TRANSLATED?.learning;

  let hintVisible = $state(false);
  let input = $state("");
  let submitted = $state(false);
  let correct = $state(false);
  let corrected = $state(false);
  let editing = $state(false);
  let editValue = $state("");
  let editEl = $state(null);
  let inputEl = $state(null);
  let audioFinished = $state(!targetAsset);
  let keyboard;

  $effect(() => {
    if (editing && editEl) editEl.focus();
    else if (inputEl && !submitted) inputEl.focus();
    else if (submitted && keyboard) keyboard.focus();
  });

  function evaluate(text) {
    return string.matches(text, answer);
  }

  function submit() {
    if (!input.trim() || submitted) return;
    submitted = true;
    correct = evaluate(input);

    terminal.daemon.connection.call("/review/literal", {
      signal: correct ? "SUCCESS" : "MISTAKE",
      scope: { literal: target.id },
    });

    if (audioFinished && correct) {
      setTimeout(() => advance(), 800);
    }
  }

  function onAudioEnded() {
    audioFinished = true;
    if (submitted && correct) setTimeout(() => advance(), 400);
  }

  function startCorrection() {
    if (correct || corrected) return;
    editing = true;
    editValue = "";
  }

  function commitCorrection() {
    if (string.matches(editValue, answer)) {
      corrected = true;
      editing = false;
      editValue = "";
    } else {
      editValue = "";
    }
  }

  function handleCorrectionKey(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      commitCorrection();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      editing = false;
      editValue = "";
    }
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

<Keyboard bind:this={keyboard} />
<ViewportLock />
<svelte:window onkeydown={handleKey} />

<Desk>
  {#snippet surface()}
    <div class="meta">
      <span class="meta-lang">Conjugation</span>
    </div>

    <div class="header">
      <div class="header-text">
        <h2 class="infinitive">{prompt}</h2>
        {#if headerLabel}
          <p class="tense-label">{headerLabel}</p>
        {/if}
      </div>
      <div class="header-actions">
        <button class="btn-hint" onclick={() => hintVisible = true}>{hintVisible ? infinitiveText : "?"}</button>
        {#if infinitiveAsset}
          <Asset asset={infinitiveAsset} variant="dot" />
        {/if}
      </div>
    </div>

    <div class="card">
      {#if person}
        <span class="person">{person}</span>
      {/if}

      {#if submitted}
        <div class="feedback">
          <div
            class="fb-line"
            class:fb-ok={correct || corrected}
            class:fb-miss={!correct && !corrected}>
            <span class="fb-icon">{correct || corrected ? "✓" : "✗"}</span>
            {#if editing}
              <input
                class="fb-edit"
                bind:this={editEl}
                bind:value={editValue}
                onkeydown={handleCorrectionKey}
                onblur={commitCorrection}
                placeholder={answer} />
            {:else if !correct && !corrected}
              <button
                type="button"
                class="fb-input fb-button"
                onmousedown={(e) => e.preventDefault()}
                onclick={startCorrection}>
                {string.clean(input) || "—"}
              </button>
            {:else}
              <span class="fb-input">{correct || corrected ? answer : string.clean(input)}</span>
            {/if}
            {#if targetAsset}
              <Asset asset={targetAsset} variant="dot" autoplay={true} onended={onAudioEnded} />
            {/if}
          </div>
          {#if !correct && !corrected}
            <div class="fb-answer">
              <span class="fb-answer-label">expected</span>
              <span class="fb-answer-text">{answer}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet controls()}
    <input
      class="field"
      class:field-locked={submitted}
      bind:this={inputEl}
      value={input}
      oninput={(e) => { if (!submitted) input = e.target.value; else e.target.value = input; }}
      placeholder="type the form…"
    />
    {#if !submitted}
      <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={submit}>
        Check
      </button>
    {:else}
      <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
        Next
      </button>
    {/if}
  {/snippet}
</Desk>

<style>
  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
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

  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .header-text { flex: 1; }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn-hint {
    min-width: 32px;
    height: 32px;
    padding: 0 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    font-style: italic;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }
  .infinitive {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0;
  }
  .header-known {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-md);
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
    margin: 0.25rem 0 0 0;
  }
  .tense-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
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
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--colors-theme-primary-contrast);
    letter-spacing: 0.04em;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-md);
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
    font-size: var(--font-size-base);
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
  .fb-button {
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
  .fb-edit {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    line-height: 1.3;
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    color: var(--colors-system-error-contrast);
    flex: 1;
    min-width: 0;
  }

  .fb-answer {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .fb-answer-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .fb-answer-text {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-theme-primary-contrast);
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
  .field-locked { opacity: 0.4; pointer-events: none; }

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

  .btn-next {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: var(--font-size-base);
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  @media (max-width: 640px) {
    .infinitive { font-size: var(--font-size-xl); }
    .fb-input, .fb-answer-text { font-family: var(--font-family-sans-text); }
  }
</style>

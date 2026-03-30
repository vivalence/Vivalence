<script>
  import { Asset, ViewportLock } from "@vivalence/drapes";
  import { string } from "@vivalence/typology";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const literals = buffer.literals ?? [];
  const symbols = buffer.symbols ?? [];
  const feedbackMode = data.feedback ?? "realtime";

  const SLOTS = [
    { key: "firstSingular", person: "eu" },
    { key: "secondSingular", person: "tu/você" },
    { key: "thirdSingular", person: "ele/ela" },
    { key: "firstPlural", person: "nós" },
    { key: "secondPlural", person: "vós" },
    { key: "thirdPlural", person: "eles/elas" },
  ];

  function findLiteral(id) {
    return id ? literals.find((l) => l.id === id) : null;
  }
  function findSymbol(id) {
    return id ? symbols.find((s) => s.id === id) : null;
  }

  const infinitive = findLiteral(data.infinitive);
  const lemmaSymbol = findSymbol(data.lemma);
  const tenseSymbol = findSymbol(data.tense);
  const moodSymbol = findSymbol(data.mood);

  const tenseLabel = tenseSymbol?.trait?.LABELED?.name ?? "";
  const moodLabel = moodSymbol?.trait?.LABELED?.name ?? "";
  const headerLabel = [tenseLabel, moodLabel].filter(Boolean).join(" · ") || "conjugation";

  const infinitiveText = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const infinitiveAsset = infinitive?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(infinitive.trait.VOCALIZED.asset)
    : null;

  // Build active slots from data
  const activeSlots = SLOTS.filter((s) => data[s.key])
    .map((s) => ({ ...s, literal: findLiteral(data[s.key]) }))
    .filter((s) => s.literal);

  function recallFor(slotKey) {
    const r = data.recall;
    if (!r) return "LEARNING";
    if (typeof r === "object") return r[slotKey] ?? "LEARNING";
    return r;
  }

  function answerFor(slot) {
    const recall = recallFor(slot.key);
    return recall === "KNOWN"
      ? slot.literal.trait?.TRANSLATED?.known
      : slot.literal.trait?.TRANSLATED?.learning;
  }

  function promptFor(slot) {
    const recall = recallFor(slot.key);
    return recall === "KNOWN"
      ? slot.literal.trait?.TRANSLATED?.learning
      : slot.literal.trait?.TRANSLATED?.known;
  }

  function getAsset(slot) {
    const ref = slot.literal?.trait?.VOCALIZED?.asset;
    return ref ? terminal.daemon.getAsset(ref) : null;
  }

  function audioVisible(slot) {
    const recall = recallFor(slot.key);
    if (recall === "KNOWN") return true;
    if (feedbackMode === "batch") return reviewed;
    const cell = cells[slot.key];
    return cell?.signal === "SUCCESS" || reviewed;
  }

  // Order
  const orderedSlots = (() => {
    if (data.order === "random") {
      const arr = [...activeSlots];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    return activeSlots;
  })();

  // Cell state: { input, signal, committed }
  let cells = $state(
    Object.fromEntries(
      activeSlots.map((s) => [s.key, { input: "", signal: null, committed: false }]),
    ),
  );
  let queue = $state([...orderedSlots]);
  let cursor = $state(0);
  let reviewed = $state(false);
  let input = $state("");
  let inputEl = $state(null);

  const activeSlot = $derived(cursor < queue.length ? queue[cursor] : null);
  const allCommitted = $derived(activeSlots.every((s) => cells[s.key].committed));
  const progress = $derived(activeSlots.filter((s) => cells[s.key].committed).length);
  const mistakeCount = $derived(
    activeSlots.filter((s) => cells[s.key].signal === "MISTAKE").length,
  );

  $effect(() => {
    if (inputEl && activeSlot && !reviewed) inputEl.focus();
  });

  function evaluate(text, slot) {
    const expected = answerFor(slot);
    const alts = string.separate(expected);
    return alts.some((alt) => string.fold(text) === string.fold(alt));
  }

  function commitCell() {
    if (!activeSlot || !input.trim()) return;
    const slot = activeSlot;
    const correct = evaluate(input, slot);
    const signal = correct ? "SUCCESS" : "MISTAKE";

    cells[slot.key] = { input: input.trim(), signal, committed: true };

    if (feedbackMode === "realtime") {
      terminal.daemon.call("/review/literal", {
        signal,
        scope: { literal: slot.literal.id },
      });
    }

    input = "";

    // Re-queue mistakes at the end (sticky)
    if (!correct) {
      queue = [...queue, slot];
    }

    cursor++;
  }

  function skipCell() {
    if (!activeSlot) return;
    input = "";
    cursor++;
  }

  function reviewBatch() {
    reviewed = true;
    const allWrong = activeSlots.every((s) => cells[s.key].signal === "MISTAKE");

    for (const slot of activeSlots) {
      const cell = cells[slot.key];
      if (!cell.committed) continue;
      const signal = allWrong ? "FAILURE" : cell.signal;
      terminal.daemon.call("/review/literal", {
        signal,
        scope: { literal: slot.literal.id },
      });
    }
  }

  function advance() {
    buffer.release();
  }

  function handleKey(event) {
    if (event.target.closest("textarea")) return;
    if (reviewed) {
      if (event.key === "Enter") advance();
      return;
    }
    if (!activeSlot && allCommitted) {
      if (feedbackMode === "batch" && event.key === "Enter") reviewBatch();
      else if (feedbackMode === "realtime" && event.key === "Enter") advance();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commitCell();
    }
    if (event.key === "Tab") {
      event.preventDefault();
      skipCell();
    }
  }
</script>

<ViewportLock />
<svelte:window onkeydown={handleKey} />

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      <div class="meta">
        <span class="meta-lang">Paradigm</span>
        <span class="meta-type">{progress}/{activeSlots.length}</span>
      </div>

      <div class="header">
        <div class="header-text">
          <h2 class="infinitive">{infinitiveText}</h2>
          <p class="tense-label">{headerLabel}</p>
        </div>
        {#if infinitiveAsset}
          <Asset asset={infinitiveAsset} variant="dot" />
        {/if}
      </div>

      <div class="table">
        {#each activeSlots as slot}
          {@const cell = cells[slot.key]}
          {@const isActive = activeSlot?.key === slot.key && !reviewed}
          {@const showAnswer = feedbackMode === "realtime" ? cell.committed : reviewed}
          {@const showAudio = audioVisible(slot)}
          <div
            class="row"
            class:row-active={isActive}
            class:row-ok={showAnswer && cell.signal === "SUCCESS"}
            class:row-miss={showAnswer && cell.signal === "MISTAKE"}>
            <span class="person">{slot.person}</span>

            <div class="cell">
              {#if showAnswer && cell.committed}
                <span
                  class="cell-input"
                  class:cell-ok={cell.signal === "SUCCESS"}
                  class:cell-miss={cell.signal === "MISTAKE"}>
                  {cell.input}
                </span>
                {#if cell.signal === "MISTAKE"}
                  <span class="cell-correct">{answerFor(slot)}</span>
                {/if}
              {:else if cell.committed}
                <span class="cell-pending">···</span>
              {:else if isActive}
                <span class="cell-prompt">{promptFor(slot)}</span>
              {:else}
                <span class="cell-empty">___</span>
              {/if}
            </div>

            {#if showAudio && getAsset(slot)}
              <Asset asset={getAsset(slot)} variant="dot" />
            {:else}
              <span class="dot-spacer"></span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      {#if reviewed}
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
          Next
        </button>
      {:else if allCommitted && feedbackMode === "batch"}
        <button
          class="btn btn-review"
          onmousedown={(e) => e.preventDefault()}
          onclick={reviewBatch}>
          Review
        </button>
      {:else if allCommitted && feedbackMode === "realtime"}
        <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
          Next
        </button>
      {:else if activeSlot}
        <span class="input-person">{activeSlot.person}</span>
        <input
          class="field"
          bind:this={inputEl}
          value={input}
          oninput={(e) => {
            input = e.target.value;
          }}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitCell();
            }
            if (e.key === "Tab") {
              e.preventDefault();
              skipCell();
            }
          }}
          placeholder="type the form…" />
        <button class="btn-check" onmousedown={(e) => e.preventDefault()} onclick={commitCell}>
          Check
        </button>
      {:else}
        <span class="menu-hint">…</span>
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
  .meta-type {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--colors-skeleton-1-boundary);
  }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .header-text {
    flex: 1;
  }
  .infinitive {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0;
  }
  .tense-label {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
    margin: 0.25rem 0 0 0;
  }

  /* ── table ── */
  .table {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .row {
    display: grid;
    grid-template-columns: 5.5rem 1fr auto;
    gap: 0 0.75rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent);
    transition: background 0.15s;
  }
  .row:nth-child(odd) {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 65%, transparent);
  }
  .row-active {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 25%, transparent) !important;
    outline: 1px solid color-mix(in srgb, var(--colors-theme-primary-contrast) 30%, transparent);
  }
  .row-ok {
    background: color-mix(
      in srgb,
      var(--colors-system-success-surface) 20%,
      transparent
    ) !important;
  }
  .row-miss {
    background: color-mix(in srgb, var(--colors-system-error-surface) 20%, transparent) !important;
  }

  .person {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
  }

  .cell {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    min-height: 1.5rem;
  }
  .cell-input {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    line-height: 1.35;
  }
  .cell-ok {
    color: var(--colors-system-success-contrast);
  }
  .cell-miss {
    color: var(--colors-system-error-contrast);
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }
  .cell-correct {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--colors-theme-primary-contrast);
    line-height: 1.35;
  }
  .cell-prompt {
    font-family: var(--font-family-serif-heading);
    font-size: 0.8rem;
    color: var(--colors-palette-gray-100);
    font-style: italic;
  }
  .cell-empty {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.4;
  }
  .cell-pending {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .dot-spacer {
    width: 32px;
    flex-shrink: 0;
  }

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
  .input-person {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-theme-primary-contrast);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 4rem;
  }
  .field {
    flex: 1;
    min-width: 0;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(
      in srgb,
      var(--colors-skeleton-1-surface) 50%,
      var(--colors-skeleton-app-surface)
    );
    color: var(--colors-palette-gray-10);
    font-size: 1rem;
    font-family: var(--font-family-serif-heading);
    outline: none;
    box-sizing: border-box;
  }
  .field::placeholder {
    color: var(--colors-skeleton-1-boundary);
  }

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

  .btn {
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
  .btn-review {
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
    border: none;
  }

  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .infinitive {
      font-size: var(--font-size-xl);
    }
    .person {
      font-size: 0.6rem;
    }
    .row {
      padding: 0.5rem 0.625rem;
    }
    .cell-input,
    .cell-correct {
      font-family: var(--font-family-sans-text);
    }
  }
</style>

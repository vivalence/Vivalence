<script>
  import { Asset, Desk, Keyboard, ViewportLock } from "@vivalence/drapes";
  import { string } from "@vivalence/typology";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const literals = buffer.literals ?? [];
  const symbols = buffer.symbols ?? [];
  const feedbackMode = data.feedback ?? "REALTIME";

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

  const infinitiveText = infinitive?.trait?.TRANSLATED?.known ?? "";
  const infinitiveHint = infinitive?.trait?.TRANSLATED?.learning ?? "";
  const infinitiveAsset = infinitive?.trait?.VOCALIZED?.asset
    ? terminal.daemon.getAsset(infinitive.trait.VOCALIZED.asset)
    : null;

  const suffixSymbol = symbols.find((s) => s.slug?.includes("suffix"));
  const regularitySymbol = symbols.find((s) => s.slug?.includes("regularity"));
  const suffixLabel = suffixSymbol ? `-${suffixSymbol.slug.split(".").pop()}` : "";
  const regularityLabel = regularitySymbol?.slug?.split(".")?.pop() ?? "";

  const tenseLabel = tenseSymbol?.trait?.LABELED?.name ?? tenseSymbol?.slug?.split(".")?.pop() ?? "";
  const moodLabel = moodSymbol?.trait?.LABELED?.name ?? moodSymbol?.slug?.split(".")?.pop() ?? "";
  const headerLabel = [tenseLabel, moodLabel, suffixLabel, regularityLabel].filter(Boolean).join(" · ");

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
    if (feedbackMode === "BATCH") return reviewed;
    const cell = cells[slot.key];
    return cell?.signal === "SUCCESS" || reviewed;
  }

  // Order
  const orderedSlots = (() => {
    if (data.order === "RANDOM") {
      const arr = [...activeSlots];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    return activeSlots;
  })();

  // Cell state: { input, signal, committed, corrected }
  let cells = $state(
    Object.fromEntries(
      activeSlots.map((s) => [
        s.key,
        { input: "", signal: null, committed: false, corrected: false },
      ]),
    ),
  );
  let queue = $state([...orderedSlots]);
  let cursor = $state(0);
  let reviewed = $state(false);
  let input = $state("");
  let inputEl = $state(null);
  let hintVisible = $state(false);
  let keyboard;
  let rowEls = $state({});
  let editingKey = $state(null);
  let editValue = $state("");
  let editEl = $state(null);

  const conjugation = literals[0];
  const activeSlot = $derived(cursor < queue.length ? queue[cursor] : null);
  const activePrompt = $derived(activeSlot ? promptFor(activeSlot) : infinitiveText);
  const allCommitted = $derived(activeSlots.every((s) => cells[s.key].committed));
  const progress = $derived(activeSlots.filter((s) => cells[s.key].committed).length);
  const mistakeCount = $derived(
    activeSlots.filter((s) => cells[s.key].signal === "MISTAKE").length,
  );

  $effect(() => {
    if (editingKey && editEl) editEl.focus();
    else if (inputEl && activeSlot && !reviewed) inputEl.focus();
    else if (keyboard && (reviewed || allCommitted)) keyboard.focus();
  });

  function startCorrection(key) {
    const cell = cells[key];
    if (!cell || cell.corrected || cell.signal !== "MISTAKE") return;
    editingKey = key;
    editValue = "";
  }

  function commitCorrection(key) {
    const slot = activeSlots.find((s) => s.key === key);
    if (!slot) {
      editingKey = null;
      editValue = "";
      return;
    }
    if (string.matches(editValue, answerFor(slot))) {
      cells[key] = { ...cells[key], corrected: true };
      editingKey = null;
      editValue = "";
    } else {
      editValue = "";
    }
  }

  function handleCorrectionKey(event, key) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      commitCorrection(key);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      editingKey = null;
      editValue = "";
    }
  }

  $effect(() => {
    if (activeSlot && rowEls[activeSlot.key]) {
      rowEls[activeSlot.key].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  function evaluate(text, slot) {
    return string.matches(text, answerFor(slot));
  }

  function commitCell() {
    if (!activeSlot || !input.trim()) return;
    const slot = activeSlot;
    const correct = evaluate(input, slot);
    const signal = correct ? "SUCCESS" : "MISTAKE";

    cells[slot.key] = { input: input.trim(), signal, committed: true, corrected: false };

    if (feedbackMode === "REALTIME") {
      terminal.daemon.connection.call("/review/literal", {
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

    if (feedbackMode === "REALTIME" && activeSlots.every((s) => cells[s.key].committed)) {
      reviewConjugation();
    }
  }

  function skipCell() {
    if (!activeSlot) return;
    input = "";
    cursor++;
  }

  function reviewConjugation() {
    if (!conjugation) return;
    const total = activeSlots.length;
    const mistakes = activeSlots.filter((s) => cells[s.key].signal === "MISTAKE").length;
    const signal = mistakes === 0 ? "SUCCESS" : mistakes === total ? "FAILURE" : "MISTAKE";
    terminal.daemon.connection.call("/review/literal", {
      signal,
      scope: { literal: conjugation.id },
    });
  }

  function reviewBatch() {
    reviewed = true;
    const allWrong = activeSlots.every((s) => cells[s.key].signal === "MISTAKE");

    for (const slot of activeSlots) {
      const cell = cells[slot.key];
      if (!cell.committed) continue;
      const signal = allWrong ? "FAILURE" : cell.signal;
      terminal.daemon.connection.call("/review/literal", {
        signal,
        scope: { literal: slot.literal.id },
      });
    }

    reviewConjugation();
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
    if (event.key === "Enter") {
      event.preventDefault();
      if (allCommitted) {
        if (feedbackMode === "BATCH") reviewBatch();
        else advance();
      } else {
        commitCell();
      }
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      skipCell();
    }
  }
</script>

<Keyboard bind:this={keyboard} />
<ViewportLock />
<svelte:window onkeydown={handleKey} />

<Desk>
  {#snippet surface()}
    <div class="meta">
      <span class="meta-lang">Paradigm</span>
      <span class="meta-type">{progress}/{activeSlots.length}</span>
      {#if infinitiveText}
        <span class="meta-infinitive">{infinitiveText}</span>
      {/if}
    </div>

    <div class="header">
      <div class="header-text">
        <h2 class="infinitive">{activePrompt}</h2>
        {#if headerLabel}
          <p class="tense-label">{headerLabel}</p>
        {/if}
      </div>
      <div class="header-actions">
        <button class="btn-hint" onclick={() => hintVisible = true}>{hintVisible ? infinitiveHint : "?"}</button>
        {#if infinitiveAsset}
          <Asset asset={infinitiveAsset} variant="dot" />
        {/if}
      </div>
    </div>

    <div class="table">
      {#each activeSlots as slot}
        {@const cell = cells[slot.key]}
        {@const isActive = activeSlot?.key === slot.key && !reviewed}
        {@const showAnswer = feedbackMode === "REALTIME" ? cell.committed : reviewed}
        {@const showAudio = audioVisible(slot)}
        <div
          bind:this={rowEls[slot.key]}
          class="row"
          class:row-active={isActive}
          class:row-ok={showAnswer && (cell.signal === "SUCCESS" || cell.corrected)}
          class:row-miss={showAnswer && cell.signal === "MISTAKE" && !cell.corrected}>
          <span class="person">{slot.person}</span>

          <div class="cell">
            {#if showAnswer && cell.committed}
              {#if editingKey === slot.key}
                <input
                  class="cell-edit"
                  bind:this={editEl}
                  bind:value={editValue}
                  onkeydown={(event) => handleCorrectionKey(event, slot.key)}
                  onblur={() => commitCorrection(slot.key)}
                  placeholder={answerFor(slot)} />
              {:else if cell.signal === "MISTAKE" && !cell.corrected}
                <button
                  type="button"
                  class="cell-input cell-miss cell-button"
                  onmousedown={(e) => e.preventDefault()}
                  onclick={() => startCorrection(slot.key)}>
                  {cell.input}
                </button>
                <span class="cell-correct">{answerFor(slot)}</span>
              {:else}
                <span
                  class="cell-input"
                  class:cell-ok={cell.signal === "SUCCESS" || cell.corrected}
                  class:cell-miss={cell.signal === "MISTAKE" && !cell.corrected}>
                  {cell.corrected ? answerFor(slot) : cell.input}
                </span>
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
  {/snippet}

  {#snippet controls()}
    {#if reviewed}
      <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
        Next
      </button>
    {:else if allCommitted && feedbackMode === "BATCH"}
      <button
        class="btn btn-review"
        onmousedown={(e) => e.preventDefault()}
        onclick={reviewBatch}>
        Review
      </button>
    {:else if allCommitted && feedbackMode === "REALTIME"}
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
            e.stopPropagation();
            commitCell();
          }
          if (e.key === "Tab") {
            e.preventDefault();
            e.stopPropagation();
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
  .meta-type {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--colors-skeleton-1-boundary);
  }
  .meta-infinitive {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    font-style: italic;
    color: var(--colors-skeleton-2-contrast);
    margin-left: auto;
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
  .tense-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    margin: 0.25rem 0 0 0;
  }

  /* ── table ── */
  .table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
    overflow: hidden;
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
    max-width: 100%;
    box-sizing: border-box;
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
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
  }

  .cell {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    min-height: 1.5rem;
    min-width: 0;
    overflow: hidden;
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
  .cell-button {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font: inherit;
    text-align: left;
  }
  .cell-edit {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    line-height: 1.35;
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    color: var(--colors-palette-gray-10);
    flex: 1;
    min-width: 0;
  }
  .cell-prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    color: var(--colors-palette-gray-100);
    font-style: italic;
  }
  .cell-empty {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.4;
  }
  .cell-pending {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }

  .dot-spacer {
    width: 32px;
    flex-shrink: 0;
  }

  .input-person {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-theme-primary-contrast);
    white-space: nowrap;
    flex-shrink: 0;
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
    font-size: var(--font-size-base);
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
    font-size: var(--font-size-md);
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
    font-size: var(--font-size-base);
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
    font-size: var(--font-size-sm);
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .infinitive {
      font-size: var(--font-size-xl);
    }
    .person {
      font-size: var(--font-size-xs);
    }
    .row {
      grid-template-columns: 4rem 1fr auto;
      padding: 0.5rem 0.5rem;
    }
    .cell-input,
    .cell-correct {
      font-family: var(--font-family-sans-text);
    }
  }
</style>

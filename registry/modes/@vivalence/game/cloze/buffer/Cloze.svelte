<script>
  import { Keyboard, Asset, ViewportLock, Desk } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  let keyboard;

  const data = buffer.data ?? {};
  const gameplay = data.gameplay ?? "TYPE";
  const blankIndices = new Set(data.blankIndices ?? []);
  const forgiving = data.forgiving ?? true;

  let literal = $state(buffer.literals?.[0] ?? null);
  let loading = $state(!literal);
  let submitted = $state(false);
  let answers = $state({});

  const tokens = $derived(literal?.trait?.ANNOTATED?.tokens ?? []);
  const known = $derived(literal?.trait?.TRANSLATED?.known);
  const asset = $derived(terminal.daemon.getAsset(literal?.trait?.VOCALIZED?.asset));
  const isListenMode = $derived(gameplay === "LISTEN");

  if (!literal) {
    terminal.daemon.call("/pick/literal/feed", { limit: 1, where: { traits: { $contains: "ANNOTATED" } } }).then(([lit]) => {
      literal = lit ?? null;
      if (literal && !blankIndices.size) blankIndices.add(0);
      loading = false;
    });
  }

  function normalize(text) {
    if (!forgiving) return text.trim();
    return text.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function evaluate(index) {
    const token = tokens[index];
    if (!token) return false;
    return normalize(answers[index] ?? "") === normalize(token.form);
  }

  function submit() {
    if (submitted) return;
    submitted = true;

    for (const i of blankIndices) {
      const token = tokens[i];
      if (!token) continue;
      const correct = evaluate(i);
      const literalRef = token.literal ?? literal.id;
      terminal.daemon.call("/review/literal", {
        signal: correct ? "SUCCESS" : "MISTAKE",
        scope: { literal: typeof literalRef === "object" ? literalRef.id ?? literalRef : literalRef },
      });
    }

  }

  function advance() {
    buffer.release();
  }

  function handleKey(event) {
    if (event.key === "Enter" && !submitted) {
      event.preventDefault();
      submit();
    } else if (event.key === "Enter" && submitted) {
      event.preventDefault();
      advance();
    }
  }

  function selectOption(index, option) {
    if (submitted) return;
    answers[index] = option;
    const allFilled = [...blankIndices].every((i) => answers[i]);
    if (allFilled) submit();
  }

  $effect(() => {
    if (submitted && keyboard) keyboard.focus();
  });

  const options = $derived(
    gameplay === "PICK" && data.options?.length
      ? data.options
      : gameplay === "PICK"
        ? [...new Set([...blankIndices].map((i) => tokens[i]?.form).filter(Boolean))]
        : [],
  );
</script>

<Keyboard bind:this={keyboard} />
<ViewportLock />
<svelte:window onkeydown={handleKey} />

<Desk>
  {#snippet surface()}
    {#if literal}
      {#if !isListenMode}
        <div class="meta">
          <span class="meta-lang">Português</span>
          {#if known}
            <span class="meta-hint">{known}</span>
          {/if}
        </div>
      {:else}
        <div class="meta">
          <span class="meta-lang">Listen</span>
          {#if asset}
            <div class="audio-block"><Asset autoplay={true} {asset} /></div>
          {/if}
        </div>
      {/if}

      <div class="tokens">
        {#each tokens as token, i}
          {#if blankIndices.has(i)}
            <span class="gap">
              {#if submitted}
                {@const correct = evaluate(i)}
                <span class="gap-answer" class:gap-ok={correct} class:gap-wrong={!correct}>
                  {token.form}
                </span>
                {#if !correct && answers[i]}
                  <span class="gap-yours">{answers[i]}</span>
                {/if}
              {:else if gameplay === "TYPE" || gameplay === "LISTEN"}
                <input
                  class="gap-input"
                  type="text"
                  placeholder={token.gloss ?? "…"}
                  bind:value={answers[i]}
                  autofocus={i === [...blankIndices][0]}
                />
              {:else}
                <span class="gap-gloss">{token.gloss ?? "…"}</span>
              {/if}
            </span>
          {:else if !isListenMode}
            <span class="tok">{token.form}</span>
          {:else}
            <span class="tok tok-hidden">{'_'.repeat(token.form.length)}</span>
          {/if}
        {/each}
      </div>

      {#if gameplay === "PICK" && !submitted}
        <div class="options">
          {#each options as opt}
            {@const selected = Object.values(answers).includes(opt)}
            <button
              class="opt"
              class:opt-selected={selected}
              ontouchstart={(e) => e.preventDefault()}
              onclick={() => {
                const nextBlank = [...blankIndices].find((i) => !answers[i]);
                if (nextBlank !== undefined) selectOption(nextBlank, opt);
              }}
              disabled={submitted}
            >
              {opt}
            </button>
          {/each}
        </div>
      {/if}

    {:else if loading}
      <div class="loading"><span class="dot"></span></div>
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if loading}
      <span class="menu-hint">loading…</span>
    {:else if submitted}
      <button class="btn btn-next" onmousedown={(e) => e.preventDefault()} onclick={advance}>
        Next
      </button>
    {:else if gameplay === "TYPE" || gameplay === "LISTEN"}
      <button class="btn btn-submit" onmousedown={(e) => e.preventDefault()} onclick={submit}>
        Check
      </button>
    {:else}
      <span class="menu-hint">fill the gap</span>
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
  .meta-hint {
    font-family: var(--font-family-serif-heading);
    font-size: 0.85rem;
    color: var(--colors-skeleton-1-boundary);
    font-style: italic;
  }

  .audio-block {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.625rem;
    line-height: 2.2;
    align-items: baseline;
    margin-bottom: 1.75rem;
  }

  .tok {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-10);
  }
  .tok-hidden {
    color: var(--colors-skeleton-1-boundary);
    letter-spacing: 0.15em;
  }

  .gap {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 2px solid var(--colors-theme-primary-contrast);
    padding: 0.125rem 0.25rem;
    min-width: 3rem;
  }

  .gap-input {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-10);
    background: none;
    border: none;
    outline: none;
    width: 100%;
    min-width: 4rem;
    max-width: 10rem;
    text-align: center;
    padding: 0;
  }

  .gap-gloss {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    color: var(--colors-skeleton-1-boundary);
  }

  .gap-answer {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
  }
  .gap-ok { color: var(--colors-system-success-contrast); }
  .gap-wrong { color: var(--colors-system-error-contrast); }

  .gap-yours {
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    color: var(--colors-system-error-contrast);
    text-decoration: line-through;
    opacity: 0.7;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .opt {
    min-height: 48px;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--colors-palette-gray-100);
    font-size: var(--font-size-lg);
    font-family: var(--font-family-serif-heading);
    cursor: pointer;
    transition: all 0.12s;
  }
  .opt:hover:not(:disabled) { border-color: var(--colors-skeleton-1-contrast); }
  .opt-selected {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 60%, transparent);
    border-color: var(--colors-theme-primary-contrast);
  }

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

  .menu-hint {
    display: block;
    width: 100%;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  .btn {
    flex: 1;
    min-height: 48px;
    padding: 0.75rem 0.5rem;
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
    color: var(--colors-skeleton-1-contrast);
  }

  @media (max-width: 640px) {
    .tokens { gap: 0.25rem; margin-bottom: 1.5rem; }
    .tok, .gap-answer, .gap-input { font-size: var(--font-size-lg); font-family: var(--font-family-sans-text); }
    .gap { min-width: 3.5rem; border-bottom-width: 2px; }
    .gap-input { min-width: 3.5rem; }
    .opt { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); padding: 0.75rem 1rem; min-height: 48px; }
  }
</style>

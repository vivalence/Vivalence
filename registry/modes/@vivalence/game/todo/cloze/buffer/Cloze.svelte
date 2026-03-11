<script>
  import { clozeItems, pickOne, shuffle } from "../../data.js";

  let item = $state(null);
  let opts = $state([]);
  let sel = $state(null);

  function generate() {
    const it = pickOne(clozeItems);
    item = it;
    opts = shuffle([...it.options]);
    sel = null;
  }

  generate();

  function select(opt) {
    if (sel !== null) return;
    sel = opt;
  }

  const correct = $derived(item?.tokens[item?.gapIndex]);
  const isCorrect = $derived(sel === correct);
</script>

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">

      <div class="hint">{item?.known}</div>

      <div class="tokens">
        {#each item?.tokens ?? [] as tok, i}
          {#if i === item.gapIndex}
            <span class="gap">
              {#if sel !== null}
                <span class="gap-answer" class:gap-ok={isCorrect} class:gap-wrong={!isCorrect}>{correct}</span>
              {:else}
                <span class="gap-gloss">{item.gapGloss}</span>
              {/if}
            </span>
          {:else}
            <span class="tok">{tok}</span>
          {/if}
        {/each}
      </div>

      <div class="options">
        {#each opts as opt}
          {@const isThis = sel === opt}
          {@const isAnswer = opt === correct}
          {@const answered = sel !== null}
          <button
            class="opt"
            class:opt-correct={answered && isAnswer}
            class:opt-wrong={answered && isThis && !isAnswer}
            class:opt-dimmed={answered && !isThis && !isAnswer}
            onclick={() => select(opt)}
            disabled={answered}
          >
            {opt}
          </button>
        {/each}
      </div>

      {#if sel !== null && !isCorrect}
        <div class="correction">
          The correct form is <span class="correction-answer">{correct}</span>
        </div>
      {/if}

    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="menu-inner">
      {#if sel !== null}
        <button class="btn-next" onclick={generate}>Next →</button>
      {:else}
        <span class="menu-hint">fill the gap</span>
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
    padding: 15vh 1.25rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .hint {
    font-size: 0.825rem;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
    margin-bottom: 1rem;
  }

  .tokens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    align-items: baseline;
    margin-bottom: 1.75rem;
  }

  .tok {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-xl);
    color: var(--colors-palette-gray-10);
  }

  .gap {
    border-bottom: 2px solid var(--colors-theme-primary-contrast);
    padding: 0.125rem 0.5rem;
    min-width: 3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .opt {
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

  .opt-correct {
    background: color-mix(in srgb, var(--colors-system-success-surface) 80%, transparent);
    border-color: var(--colors-system-success-contrast);
    color: var(--colors-system-success-contrast);
  }

  .opt-wrong {
    background: color-mix(in srgb, var(--colors-system-error-surface) 80%, transparent);
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }

  .opt-dimmed { opacity: 0.3; }

  .correction {
    margin-top: 1rem;
    font-size: 0.825rem;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-sans-text);
  }

  .correction-answer {
    color: var(--colors-theme-primary-contrast);
    font-family: var(--font-family-serif-heading);
  }

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1rem 1.25rem;
  }

  .menu-inner { max-width: 480px; margin: 0 auto; }

  .btn-next {
    width: 100%;
    padding: 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }

  .menu-hint {
    display: block;
    text-align: center;
    padding: 0.875rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.75rem;
    font-family: var(--font-family-code);
  }

  @media (max-width: 640px) {
    .stage { padding-top: 10vh; }
    .tok, .gap-answer { font-size: var(--font-size-lg); }
    .opt { font-size: var(--font-size-base); padding: 0.5rem 1rem; }
    .menu { padding: 0.75rem 1rem; }
  }
</style>

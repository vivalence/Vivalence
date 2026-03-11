<script>
  import { words, sentences, pickOne, pick, exclude, shuffle } from "../../data.js";

  const pool = [
    ...words.map((w) => ({ ...w, type: "word" })),
    ...sentences.map((s) => ({ ...s, type: "sentence" })),
  ];

  let target = $state(null);
  let direction = $state("l1l2");
  let options = $state([]);
  let selected = $state(null);

  function generate() {
    const t = pickOne(pool);
    const d = Math.random() > 0.5 ? "l1l2" : "l2l1";
    const same = pool.filter((x) => x.type === t.type && x.slug !== t.slug);
    const distractors = pick(same, 3);
    target = t;
    direction = d;
    options = shuffle([t, ...distractors]);
    selected = null;
  }

  generate();

  const prompt = $derived(target ? (direction === "l1l2" ? target.known : target.learning) : "");
  const promptLang = $derived(direction === "l1l2" ? "English" : "Português");
  const answerLang = $derived(direction === "l1l2" ? "Português" : "English");
  const optionText = (o) => direction === "l1l2" ? o.learning : o.known;
  const isCorrect = $derived(selected === target?.slug);

  function select(slug) {
    if (selected !== null) return;
    selected = slug;
  }
</script>

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="stage">

      <div class="meta">
        <span class="tag tag-lang">{promptLang}</span>
        <span class="tag tag-muted">{target?.type}</span>
      </div>

      <p class="prompt" class:prompt-word={target?.type === "word"}>
        {prompt}
      </p>

      <div class="options">
        {#each options as option (option.slug)}
          {@const isThis = selected === option.slug}
          {@const isAnswer = option.slug === target?.slug}
          {@const answered = selected !== null}
          <button
            class="option"
            class:option-correct={answered && isAnswer}
            class:option-wrong={answered && isThis && !isAnswer}
            class:option-dimmed={answered && !isThis && !isAnswer}
            onclick={() => select(option.slug)}
            disabled={answered}
          >
            {optionText(option)}
          </button>
        {/each}
      </div>

    </div>
  </div>

  <div class="bsp-chain-end menu">
    <div class="menu-inner">
      {#if selected !== null}
        <button class="btn-next" onclick={generate}>Next →</button>
      {:else}
        <span class="menu-hint">pick the {answerLang} translation</span>
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

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tag {
    padding: 0.15rem 0.5rem;
    border-radius: 0.25rem;
    font-family: var(--font-family-code);
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .tag-lang {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 60%, transparent);
    color: var(--colors-theme-primary-contrast);
  }

  .tag-muted {
    background: var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-1-contrast);
    font-weight: 500;
  }

  .prompt {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 1.75rem 0;
  }

  .prompt-word { font-size: var(--font-size-3xl); }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option {
    padding: 0.875rem 1.125rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, var(--colors-skeleton-2-surface));
    color: var(--colors-palette-gray-100);
    font-size: var(--font-size-lg);
    font-family: var(--font-family-serif-heading);
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;
  }

  .option:hover:not(:disabled) {
    border-color: var(--colors-skeleton-1-contrast);
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

  .menu {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1rem 1.25rem;
  }

  .menu-inner {
    max-width: 480px;
    margin: 0 auto;
  }

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
    .prompt { font-size: var(--font-size-xl); }
    .prompt-word { font-size: var(--font-size-2xl); }
    .option { font-size: var(--font-size-base); }
    .menu { padding: 0.75rem 1rem; }
  }
</style>

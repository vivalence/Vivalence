<script>
  import { characterClass } from "../engine.js";

  const { view } = $props();

  let textElement;
  let caretElement;

  $effect(() => {
    if (!view) return;
    const wordIndex = view.wordIndex;
    const characterIndex = view.typed.length;
    const length = Math.max(view.words[wordIndex]?.length ?? 0, view.typed.length);
    const element = document.getElementById(
      characterIndex < length ? `c-${wordIndex}-${characterIndex}` : `e-${wordIndex}`,
    );
    if (!element || !textElement || !caretElement) return;
    const glyph = element.getBoundingClientRect();
    const frame = textElement.getBoundingClientRect();
    caretElement.style.transform = `translate(${glyph.left - frame.left + textElement.scrollLeft}px, ${
      glyph.top - frame.top + textElement.scrollTop
    }px)`;
    caretElement.style.height = glyph.height + "px";
    element.scrollIntoView({ block: "nearest" });
  });
</script>

<div class="words" bind:this={textElement}>
    <div class="caret" bind:this={caretElement}></div>
    {#each view.words as target, wordIndex}
      {#if wordIndex < view.wordIndex}
        <span class="word done {view.marks[wordIndex]}">{target} </span>
      {:else if wordIndex > view.wordIndex}
        <span class="word todo">{target} </span>
      {:else}
        <span class="word cur"
          >{#each Array(Math.max(target.length, view.typed.length)) as _, characterIndex}{@const expected =
              target[characterIndex]}{@const character = view.typed[characterIndex]}<span
              id={`c-${wordIndex}-${characterIndex}`}
              class={character != null ? characterClass(expected, character) : "pend"}
              >{expected ?? character}</span
            >{/each}<span id={`e-${wordIndex}`}> </span></span>
      {/if}
    {/each}
</div>

<style>
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--colors-palette-gray-10);
    margin: 0 0 1.25rem 0;
  }
  .dim {
    color: var(--colors-skeleton-1-boundary);
    font-weight: 400;
  }
  .accent {
    color: var(--colors-theme-primary-contrast);
  }
  .words {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.7rem;
    width: 100%;
    max-width: 720px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xl);
    line-height: 1.9;
    max-height: 24rem;
    overflow-y: auto;
  }
  .caret {
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    background: var(--colors-theme-primary-contrast);
    transition: transform 0.07s ease;
    pointer-events: none;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0.3;
    }
  }
  .word {
    white-space: pre;
  }
  .word.todo,
  .pend {
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.55;
  }
  .word.done.g,
  .g {
    color: var(--colors-system-success-contrast);
  }
  .word.done.y,
  .y {
    color: var(--colors-system-warning-contrast);
  }
  .word.done.r,
  .r {
    color: var(--colors-system-error-contrast);
  }
</style>

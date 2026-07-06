<script>
  // One word cell — the shared atom of both BLOCK and RIVER. Renders its state
  // (done / todo / cur / reveal) from the projected view and emits the caret-target
  // ids for the current word. reveal is river-only (Nyan withholds glosses in block).
  import { characterClass } from "../engine.js";

  const { view, glosses, wordIndex } = $props();

  const target = $derived(view.words[wordIndex]);
  const gloss = $derived(glosses?.[wordIndex] ?? "");
  const state = $derived(
    wordIndex < view.wordIndex
      ? gloss
        ? "reveal"
        : "done"
      : wordIndex > view.wordIndex
        ? "todo"
        : "cur",
  );
</script>

<span class="cell">
  {#if state === "reveal"}
    <span class="word reveal {view.marks[wordIndex]}">{gloss}</span>
  {:else if state === "done"}
    <span class="word done {view.marks[wordIndex]}">{target}</span>
  {:else if state === "todo"}
    <span class="word todo">{target}</span>
  {:else}
    <span class="word cur"
      >{#each Array(Math.max(target.length, view.typed.length)) as _, characterIndex}{@const expected =
          target[characterIndex]}{@const character = view.typed[characterIndex]}<span
          id={`c-${wordIndex}-${characterIndex}`}
          class={character != null ? characterClass(expected, character) : "pend"}
          >{expected ?? character}</span
        >{/each}<span id={`e-${wordIndex}`}> </span></span>
  {/if}
</span>

<style>
  .cell {
    display: inline-flex;
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
  /* reveal — the committed word replaced by its gloss, faded in in place (river only) */
  .word.reveal {
    color: var(--colors-palette-gray-10);
    animation: reveal 0.25s ease both;
  }
  @keyframes reveal {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.85;
    }
  }
</style>

<script>
  // The blinking caret — shared by both layouts. Places itself over the current glyph
  // (c-word-char, or e-word past the end) within `frame`. It subtracts frame's own rect,
  // so it stays correct even when `frame` is a translated track (RIVER) — mount it INSIDE
  // that frame and the transform carries the caret with the words, no desync.
  const { view, frame } = $props();

  let bar;

  const place = () => {
    if (!view || !frame || !bar) return;
    const wordIndex = view.wordIndex;
    const characterIndex = view.typed.length;
    const length = Math.max(view.words[wordIndex]?.length ?? 0, view.typed.length);
    const element = document.getElementById(
      characterIndex < length ? `c-${wordIndex}-${characterIndex}` : `e-${wordIndex}`,
    );
    if (!element) return;
    const glyph = element.getBoundingClientRect();
    const box = frame.getBoundingClientRect();
    bar.style.transform = `translate(${glyph.left - box.left + frame.scrollLeft}px, ${
      glyph.top - box.top + frame.scrollTop
    }px)`;
    bar.style.height = glyph.height + "px";
  };

  $effect(() => {
    view.wordIndex;
    view.typed;
    frame;
    place();
  });

  // settle after fonts load + on container resize — the on-load mis-measure fix.
  $effect(() => {
    if (typeof document === "undefined" || !frame) return;
    document.fonts?.ready?.then(place);
    const observer = new ResizeObserver(place);
    observer.observe(frame);
    return () => observer.disconnect();
  });
</script>

<div class="caret" bind:this={bar}></div>

<style>
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
</style>

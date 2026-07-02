<script>
  const { terminal, buffer } = $props();

  // Only the current riddler line + the user's input are ever shown — no history.
  let answer = $state("");
  let pending = $state(false);
  let line = $state(buffer.data.history?.at(-1)?.reply ?? buffer.data.riddle);
  let resolvable = $state(false);
  let resolved = $state(buffer.data.resolved ?? false);
  let timer = null;

  // type scales with length — short retorts loom large, long ones settle down
  const fit = (text, max, min) => {
    const len = (text ?? "").trim().length;
    return Math.min(max, Math.max(min, max - (len * (max - min)) / 90));
  };
  const bubbleSize = $derived(fit(line, 2.6, 1.1));
  const answerSize = $derived(fit(answer, 1.9, 1.0));

  async function submit() {
    if (!answer.trim() || pending || resolved) return;
    pending = true;
    try {
      const r = await buffer.mode.connection.call("/assistant/message", {
        buffer: buffer.id,
        message: answer,
      });
      line = r.reply ?? line;
      answer = "";
      if (r.resolvable) arm();
    } finally {
      pending = false;
    }
  }

  // solved → offer a resolve, auto-firing after 1.5s unless triggered or dismissed
  function arm() {
    resolvable = true;
    clearTimeout(timer);
    timer = setTimeout(resolve, 1500);
  }

  function dismiss() {
    resolvable = false;
    clearTimeout(timer); // back to the duel — keep messaging
  }

  async function resolve() {
    clearTimeout(timer);
    resolvable = false;
    resolved = true;
    await buffer.mode.connection.call("/assistant/resolve", { buffer: buffer.id });
    terminal.buffer = null; // close out the riddle
  }

  function onkeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }
</script>

<div class="riddler">
  <div class="glyph">?</div>

  <div class="bubble" style="font-size: {bubbleSize}rem">{line}</div>

  {#if resolvable}
    <div class="resolve">
      <button class="go" onclick={resolve}>decifrado — resolver</button>
      <button class="dismiss" onclick={dismiss} aria-label="continuar">✕</button>
    </div>
  {:else}
    <textarea
      class="answer"
      style="font-size: {answerSize}rem"
      bind:value={answer}
      placeholder="responda ao enigma…"
      disabled={pending || resolved}
      {onkeydown}
    ></textarea>
  {/if}
</div>

<style>
  .riddler {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.8rem;
    padding: 2rem;
    overflow: hidden;
    background: radial-gradient(
      circle at 50% 28%,
      var(--colors-skeleton-2-surface),
      color-mix(in srgb, var(--colors-skeleton-2-surface) 65%, black)
    );
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
  }

  /* the riddler's signature, looming behind everything */
  .glyph {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 42rem;
    line-height: 1;
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.05;
    pointer-events: none;
    user-select: none;
  }

  .bubble {
    position: relative;
    max-width: 34rem;
    text-align: center;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    line-height: 1.3;
    text-wrap: balance;
    color: var(--colors-skeleton-0-primary-base);
    transition: font-size 0.25s ease;
  }

  .answer {
    position: relative;
    width: min(28rem, 80%);
    min-height: 2.6rem;
    resize: none;
    text-align: center;
    padding: 0.4rem 0.6rem;
    font-family: inherit;
    color: inherit;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    outline: none;
    transition: font-size 0.25s ease, border-color 0.2s ease;
  }
  .answer::placeholder {
    opacity: 0.3;
    font-style: italic;
  }
  .answer:focus {
    border-bottom-color: var(--colors-skeleton-0-primary-base);
  }
  .answer:disabled {
    opacity: 0.4;
  }

  .resolve {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }
  .go {
    position: relative;
    overflow: hidden;
    padding: 0.55rem 1.3rem;
    font-family: var(--font-family-display, Georgia, serif);
    font-size: var(--font-size-sm);
    font-style: italic;
    letter-spacing: 0.04em;
    color: var(--colors-skeleton-2-surface);
    background: var(--colors-skeleton-0-primary-base);
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  /* drains over the 1.5s auto-resolve window */
  .go::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: var(--colors-skeleton-2-surface);
    opacity: 0.5;
    transform-origin: left;
    animation: drain 1.5s linear forwards;
  }
  @keyframes drain {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
  .dismiss {
    width: 1.9rem;
    height: 1.9rem;
    font-family: var(--font-family-code);
    color: inherit;
    background: transparent;
    border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.55;
  }
  .dismiss:hover {
    opacity: 1;
  }
</style>

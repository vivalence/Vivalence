<script>
  // either/or: an assistant message OR a user input — never both.
  // click the message → it gives way to the input. submit/escape → back to the message.
  //
  // smart sizing: the message is measured against the available width and steps
  // through fit tiers — base single-line → sm single-line → sm multiline → xs
  // multiline past ~4 lines. A ResizeObserver re-fits on container resize, so the
  // desk reacts to both the text and the layout around it.
  let {
    greeting = "Olá! What do you want to practice today?",
    placeholder = "Ask your tutor anything…",
    onsend,
  } = $props();

  let editing = $state(false);
  let draft = $state("");
  let message = $state(greeting);
  let pending = $state(false);
  let field = $state(null);

  let body = $state(null);
  let measurer = $state(null);
  let sizing = $state({ size: "var(--font-size-base, 1rem)", wrap: false });

  const SIZES = {
    base: "var(--font-size-base, 1rem)",
    small: "var(--font-size-sm, 0.875rem)",
    tiny: "var(--font-size-xs, 0.75rem)",
  };

  function textWidth(text, size) {
    measurer.style.fontSize = size;
    measurer.textContent = text;
    return measurer.offsetWidth;
  }

  function fit() {
    if (!body || !measurer) return;
    const available = body.clientWidth;
    if (!available) return;
    const text = pending ? "…" : message;
    if (textWidth(text, SIZES.base) <= available) {
      sizing = { size: SIZES.base, wrap: false };
    } else if (textWidth(text, SIZES.small) <= available) {
      sizing = { size: SIZES.small, wrap: false };
    } else {
      const lines = Math.ceil(textWidth(text, SIZES.small) / available);
      sizing = { size: lines > 4 ? SIZES.tiny : SIZES.small, wrap: true };
    }
  }

  $effect(() => {
    void message;
    void pending;
    void editing;
    fit();
  });

  $effect(() => {
    if (!body) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(body);
    document.fonts?.ready?.then(() => fit());
    return () => observer.disconnect();
  });

  function open() {
    editing = true;
    queueMicrotask(() => field?.focus());
  }

  async function submit(event) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) {
      editing = false;
      return;
    }
    draft = "";
    editing = false;
    pending = true;
    try {
      const reply = await onsend?.(text);
      if (reply) message = reply;
    } finally {
      pending = false;
    }
  }

  function keydown(event) {
    if (event.key === "Enter" && !event.shiftKey) submit(event);
    else if (event.key === "Escape") {
      draft = "";
      editing = false;
    }
  }
</script>

<div class="helpdesk" class:tall={sizing.wrap && !editing}>
  <span class="tag">Tutor</span>
  <span class="divider"></span>
  <div class="body" bind:this={body}>
    {#if editing}
      <form onsubmit={submit}>
        <input
          bind:this={field}
          bind:value={draft}
          {placeholder}
          onkeydown={keydown} />
      </form>
    {:else}
      <button
        class="message"
        class:wrap={sizing.wrap}
        style:font-size={sizing.size}
        onclick={open}
        disabled={pending}
        aria-label="reply to your tutor">
        {pending ? "…" : message}
      </button>
    {/if}
    <span class="measurer" bind:this={measurer} aria-hidden="true"></span>
  </div>
  {#if editing}
    <button class="send" onclick={submit} aria-label="send to your tutor">→</button>
  {/if}
</div>

<style>
  .helpdesk {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--colors-theme-primary-surface) 45%, transparent);
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 7%, transparent);
    transition: border-color 0.2s, background 0.2s;
  }
  .helpdesk:focus-within {
    border-color: color-mix(in srgb, #1EBCB5 70%, transparent);
  }
  .helpdesk.tall {
    align-items: flex-start;
  }
  .helpdesk.tall .tag {
    padding-top: 0.2em;
  }
  .helpdesk.tall .divider {
    align-self: stretch;
    height: auto;
  }
  .tag {
    flex: 0 0 auto;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #1EBCB5;
  }
  .divider {
    flex: 0 0 auto;
    width: 1px;
    height: 1.4rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 35%, transparent);
  }
  .body {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
  }
  .measurer {
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    pointer-events: none;
    font-family: var(--font-family-sans-text);
  }
  form {
    flex: 1 1 auto;
    min-width: 0;
  }
  input,
  .message {
    width: 100%;
    box-sizing: border-box;
    border: none;
    background: transparent;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-base, 1rem);
    color: var(--colors-skeleton-1-contrast);
    text-align: left;
  }
  input {
    outline: none;
  }
  input::placeholder {
    color: color-mix(in srgb, var(--colors-skeleton-1-boundary) 80%, transparent);
  }
  .message {
    flex: 1 1 auto;
    min-width: 0;
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .message.wrap {
    white-space: normal;
    overflow-wrap: anywhere;
    text-wrap: pretty;
    line-height: 1.45;
    max-height: calc(6 * 1.45em);
    overflow-y: auto;
    text-overflow: unset;
  }
  .send {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.1rem;
    height: 2.1rem;
    border: none;
    border-radius: 0.55rem;
    background: #1EBCB5;
    color: #0F1C35;
    font-size: var(--font-size-md, 0.875rem);
    cursor: pointer;
    transition: filter 0.15s, transform 0.12s;
  }
  .send:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
</style>

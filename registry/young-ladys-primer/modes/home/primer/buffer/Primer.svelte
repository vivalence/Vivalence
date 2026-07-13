<script>
  const { terminal, buffer } = $props();

  let scene = $state(null);
  let concept = $state(null);
  let progress = $state(null);
  let done = $state(false);
  let thinking = $state(true);

  async function turn(choice) {
    if (thinking && scene) return;
    thinking = true;
    try {
      const result = await buffer.mode.connection.call("/assistant/turn", {
        buffer: buffer.id,
        choice,
        thread: terminal.thread.id,
      });
      scene = result.scene ?? null;
      concept = result.concept ?? null;
      progress = result.progress ?? null;
      done = result.done ?? false;
    } finally {
      thinking = false;
    }
  }

  turn(undefined);
</script>

<div class="primer">
  <div class="page">
    <div class="eyebrow">
      <span class="mark">❦</span>
      <span>The Illustrated Primer</span>
      {#if concept}<span class="concept">· {concept.name}</span>{/if}
    </div>

    {#if done}
      <p class="prose closing">The tale is told, and you have learned to read. Every kingdom lies open to you now.</p>
    {:else if scene}
      <p class="prose" class:dim={thinking}>{scene.prose}</p>
      <p class="question" class:dim={thinking}>{scene.question}</p>
      <div class="choices">
        {#each scene.choices as choice, index}
          <button class="choice" disabled={thinking} onclick={() => turn(index)}>
            {choice.label}
          </button>
        {/each}
      </div>
    {:else}
      <p class="prose waiting">The book opens…</p>
    {/if}

    {#if thinking && scene}
      <div class="turning">the page turns…</div>
    {/if}

    {#if progress}
      <div class="progress">
        <div class="progress-track">
          <div class="progress-fill" style="width:{progress.total ? (progress.mastered / progress.total) * 100 : 0}%"></div>
        </div>
        <div class="progress-label">{progress.mastered} of {progress.total} concepts kindled</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .primer {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: radial-gradient(ellipse at 50% 30%, #1b1428 0%, #120d1c 55%, #08060f 100%);
  }
  .page {
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #d9b26a;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .mark {
    font-size: var(--font-size-sm);
    opacity: 0.8;
  }
  .concept {
    color: #8f7a5a;
    letter-spacing: 0.12em;
  }
  .prose {
    margin: 0;
    font-family: var(--font-family-serif-body);
    font-size: var(--font-size-2xl);
    line-height: 1.6;
    color: #ece3d0;
    transition: opacity 0.3s;
  }
  .prose.waiting,
  .prose.closing {
    color: #b8ac93;
    font-style: italic;
  }
  .question {
    margin: 0;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    font-style: italic;
    color: #d9b26a;
    transition: opacity 0.3s;
  }
  .dim {
    opacity: 0.35;
  }
  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .choice {
    text-align: left;
    padding: 0.9rem 1.15rem;
    background: rgba(217, 178, 106, 0.05);
    border: 1px solid rgba(217, 178, 106, 0.22);
    border-radius: 0.5rem;
    color: #ece3d0;
    font-family: var(--font-family-serif-body);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }
  .choice:hover:not(:disabled) {
    background: rgba(217, 178, 106, 0.12);
    border-color: rgba(217, 178, 106, 0.5);
    transform: translateY(-1px);
  }
  .choice:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .turning {
    color: #8f7a5a;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-style: italic;
    letter-spacing: 0.08em;
  }
  .progress {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .progress-track {
    height: 3px;
    background: rgba(217, 178, 106, 0.14);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #d9b26a;
    border-radius: 2px;
    transition: width 0.5s ease;
  }
  .progress-label {
    color: #6f6350;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.1em;
  }
</style>

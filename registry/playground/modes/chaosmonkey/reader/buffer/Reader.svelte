<script>
  let { buffer } = $props();
</script>

<div class="reader-hub">
  <span class="glyph">❡</span>
  <h2>Reader</h2>
  <p>Describe an interface in the chat. I'll build it live, just for this.</p>
  <p class="hint">Then push it around — “sepia”, “bigger type”, “add a progress bar”…</p>
</div>

<style>
  .reader-hub {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-align: center;
    padding: 2rem;
    color: var(--colors-skeleton-0-contrast);
  }
  .glyph {
    font-size: 2.5rem;
    opacity: 0.5;
  }
  h2 {
    margin: 0;
    font-weight: 600;
  }
  p {
    margin: 0;
    max-width: 34ch;
    opacity: 0.8;
  }
  .hint {
    font-size: 0.85em;
    opacity: 0.5;
  }
</style>

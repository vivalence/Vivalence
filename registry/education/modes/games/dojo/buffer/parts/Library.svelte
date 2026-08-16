<script>
  const { saved = [], recents = [], summary, closable = false, onload, onforget, onclose } = $props();

  const ago = (stamp) => {
    if (!stamp) return "";
    const minutes = Math.max(0, Math.round((Date.now() - stamp) / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };
</script>

<div class="library">
  <div class="head">
    {#if closable}<button class="close" onclick={onclose}>×</button>{/if}
    <span class="title">library</span>
  </div>
  <div class="scroll">
    <section>
      <span class="title">saved sets</span>
      <div class="list">
        {#each saved as entry (entry.name)}
          <div class="saved">
            <button class="card" onclick={() => onload(entry)}>
              <span class="name">{entry.name}</span>
              <span class="rule">{summary(entry)}</span>
            </button>
            <button class="forget" title="forget" onclick={() => onforget(entry.name)}>×</button>
          </div>
        {/each}
        {#if !saved.length}<span class="empty">nothing saved yet — build a set, then “save” above it.</span>{/if}
      </div>
    </section>
    <section>
      <span class="title">recents</span>
      <div class="list tight">
        {#each recents as entry, index (index)}
          <button class="recent" onclick={() => onload(entry)}>
            <span class="rule">{summary(entry)}</span>
            <span class="when">{ago(entry.at)}</span>
          </button>
        {/each}
        {#if !recents.length}<span class="empty">every start lands here.</span>{/if}
      </div>
    </section>
    <!-- @beef benched — the ✦ assistant, future music: a chat whose reply carries ONE rule proposal
         ({label, count, clause}) with a “load” button that fills the builder; never adds, never starts.
    <section class="assistant">
      <button class="assistant-head" onclick={() => (chatOpen = !chatOpen)}>
        <span class="spark">✦</span><span class="title">assistant</span><span class="caret">{chatOpen ? "▴" : "▾"}</span>
      </button>
      {#if chatOpen}
        {#each messages as message}
          <div class="message"><span class="who">{message.who}</span><span class="text">{message.text}</span>
            {#if message.proposal}<div class="proposal"><span>{message.proposal.label}</span><span class="n">{message.proposal.count} subjects</span><button onclick={() => onproposal(message.proposal.clause)}>load</button></div>{/if}
          </div>
        {/each}
        <input value={chatInput} placeholder="12 weakest food nouns, no a1" onkeydown={(event) => event.key === "Enter" && send()} />
      {/if}
    </section>
    -->
  </div>
</div>

<style>
  .library {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    background: var(--colors-skeleton-1-surface);
  }
  .head {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.6rem 0.65rem 0.5rem;
  }
  .close {
    flex: none;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-theme-primary-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    cursor: pointer;
    padding: 0;
  }
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-support);
    opacity: 0.8;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.35rem;
  }
  .list.tight {
    gap: 0.1rem;
  }
  .saved {
    display: flex;
    align-items: stretch;
    gap: 0.2rem;
  }
  .card {
    flex: 1;
    min-width: 0;
    text-align: left;
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.2rem;
    background: var(--colors-skeleton-0-surface);
    padding: 0.45rem 0.55rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    color: inherit;
  }
  .card:hover {
    border-color: var(--colors-theme-primary-contrast);
  }
  .name {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
  }
  .rule {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .forget {
    flex: none;
    border: none;
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    font-size: var(--font-size-xs);
    padding: 0 0.2rem;
  }
  .forget:hover {
    color: var(--colors-system-error-contrast);
  }
  .recent {
    width: 100%;
    text-align: left;
    border: none;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    padding: 0.4rem 0.1rem;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    color: inherit;
  }
  .recent:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .recent .rule {
    flex: 1;
    min-width: 0;
    color: var(--text-body);
  }
  .when {
    flex: none;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.7;
  }
  .empty {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    line-height: 1.5;
  }
</style>

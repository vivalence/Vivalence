<script>
  import { Asset } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const data = buffer.data ?? {};
  const layout = data.layout ?? "table";
  const title = data.title ?? "";
  const subtitle = data.subtitle;
  const template = data.template;

  let literals = $state(buffer.literals ?? []);
  let loading = $state(!literals.length);

  if (!literals.length) {
    terminal.daemon.call("/pick/literal/feed", { limit: 6 }).then((lits) => {
      literals = lits ?? [];
      loading = false;
    });
  }

  function personLabel(lit) {
    const syms = lit?.symbol ?? {};
    if (syms["word.person.first"] && syms["word.number.singular"]) return "eu";
    if (syms["word.person.second"] && syms["word.number.singular"]) return "tu";
    if (syms["word.person.third"] && syms["word.number.singular"]) return "ele/ela/você";
    if (syms["word.person.first"] && syms["word.number.plural"]) return "nós";
    if (syms["word.person.second"] && syms["word.number.plural"]) return "vós";
    if (syms["word.person.third"] && syms["word.number.plural"]) return "eles/elas/vocês";
    return null;
  }

  function known(lit) { return lit?.trait?.TRANSLATED?.known; }
  function learning(lit) { return lit?.trait?.TRANSLATED?.learning; }

  const hasAudio = $derived(literals.some((l) => l?.trait?.VOCALIZED?.asset));

  function playAudio(lit) {
    const a = terminal.daemon.getAsset(lit?.trait?.VOCALIZED?.asset);
    if (a) a.play?.();
  }

  function parseTemplate(tpl, lits) {
    if (!tpl) return [];
    const parts = tpl.split(/(\{[^}]+\})/g);
    return parts.map((p) => {
      const m = p.match(/^\{(.+)\}$/);
      if (m) return { type: "slot", label: m[1] };
      return { type: "text", value: p };
    });
  }

  const templateParts = $derived(template ? parseTemplate(template, literals) : []);

  function contrastiveGroups(lits) {
    const mid = Math.ceil(lits.length / 2);
    return [lits.slice(0, mid), lits.slice(mid)];
  }

  const groups = $derived(layout === "contrastive" ? contrastiveGroups(literals) : []);

  function advance() {
    buffer.release();
  }

  function handleKey(event) {
    if (event.target.closest("input,textarea")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advance();
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface">
    <div class="stage">
      {#if literals.length}
        <div class="meta">
          <span class="meta-lang">Exhibit</span>
          <span class="meta-type">{layout}</span>
        </div>

        {#if title}
          <h2 class="title">{title}</h2>
        {/if}
        {#if subtitle}
          <p class="subtitle">{subtitle}</p>
        {/if}

        {#if layout === "table"}
          <div class="table">
            {#each literals as lit}
              {@const person = personLabel(lit)}
              <div class="table-row">
                {#if person}
                  <span class="table-person">{person}</span>
                {/if}
                <span class="table-form">{learning(lit)}</span>
                <span class="table-gloss">{known(lit)}</span>
                {#if lit?.trait?.VOCALIZED?.asset}
                  <button class="table-audio" onmousedown={(e) => e.preventDefault()} onclick={() => playAudio(lit)}>
                    <span class="audio-icon"></span>
                  </button>
                {/if}
              </div>
            {/each}
          </div>

        {:else if layout === "pattern"}
          {#if templateParts.length}
            <div class="pattern-template">
              {#each templateParts as part}
                {#if part.type === "slot"}
                  <span class="pattern-slot">{part.label}</span>
                {:else}
                  <span class="pattern-text">{part.value}</span>
                {/if}
              {/each}
            </div>
          {/if}

          <div class="examples">
            {#each literals as lit}
              <div class="example-row">
                <p class="example-learning">{learning(lit)}</p>
                <p class="example-known">{known(lit)}</p>
              </div>
            {/each}
          </div>

        {:else if layout === "contrastive"}
          <div class="contrastive">
            {#each groups as group, gi}
              <div class="contrast-col">
                {#each group as lit}
                  <div class="contrast-row">
                    <p class="contrast-learning">{learning(lit)}</p>
                    <p class="contrast-known">{known(lit)}</p>
                  </div>
                {/each}
              </div>
              {#if gi === 0}
                <div class="contrast-divider"></div>
              {/if}
            {/each}
          </div>
        {/if}

      {:else if loading}
        <div class="loading"><span class="dot"></span></div>
      {/if}
    </div>
  </div>

  <div class="viva-controls controls">
    <div class="input-row">
      {#if loading}
        <span class="menu-hint">loading...</span>
      {:else}
        <button class="btn btn-got-it" onmousedown={(e) => e.preventDefault()} onclick={advance}>
          Got it
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .stage {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: baseline;
  }
  .meta-lang {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-theme-primary-contrast);
  }
  .meta-type {
    font-family: var(--font-family-code);
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--colors-skeleton-1-boundary);
  }

  .title {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    color: var(--colors-palette-gray-10);
    line-height: 1.2;
    margin: 0 0 0.25rem 0;
  }
  .subtitle {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
    margin: 0 0 1.5rem 0;
  }

  /* ── table layout ── */
  .table {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .table-row {
    display: grid;
    grid-template-columns: 7rem 1fr 1fr auto;
    align-items: baseline;
    padding: 0.625rem 0.75rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent);
  }
  .table-row:nth-child(odd) {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 70%, transparent);
  }
  .table-person {
    font-family: var(--font-family-code);
    font-size: 0.7rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .table-form {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-base);
    color: var(--colors-theme-primary-contrast);
    line-height: 1.35;
  }
  .table-gloss {
    font-family: var(--font-family-serif-heading);
    font-size: 0.8rem;
    color: var(--colors-skeleton-1-boundary);
    line-height: 1.35;
  }
  .table-audio {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .audio-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    opacity: 0.5;
  }
  .audio-icon:hover { opacity: 1; }

  /* ── pattern layout ── */
  .pattern-template {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: baseline;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
  }
  .pattern-text {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-palette-gray-10);
  }
  .pattern-slot {
    font-family: var(--font-family-code);
    font-size: 0.8rem;
    color: var(--colors-theme-primary-contrast);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 40%, transparent);
    border: 1px dashed var(--colors-theme-primary-contrast);
  }

  .examples {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .example-row {
    padding: 0.75rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent);
  }
  .example-learning {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    color: var(--colors-palette-gray-10);
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
  }
  .example-known {
    font-family: var(--font-family-serif-heading);
    font-size: 0.85rem;
    color: var(--colors-skeleton-1-boundary);
    margin: 0;
    font-style: italic;
  }

  /* ── contrastive layout ── */
  .contrastive {
    display: flex;
    gap: 0.75rem;
  }
  .contrast-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .contrast-divider {
    width: 1px;
    background: var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }
  .contrast-row {
    padding: 0.625rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 40%, transparent);
  }
  .contrast-learning {
    font-family: var(--font-family-serif-heading);
    font-size: 1rem;
    color: var(--colors-palette-gray-10);
    margin: 0 0 0.125rem 0;
    line-height: 1.3;
  }
  .contrast-known {
    font-family: var(--font-family-serif-heading);
    font-size: 0.75rem;
    color: var(--colors-skeleton-1-boundary);
    margin: 0;
    font-style: italic;
  }

  /* ── shared ── */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2rem;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .controls {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
  }
  .input-row {
    max-width: 480px;
    margin: 0 auto;
  }
  .menu-hint {
    display: block;
    text-align: center;
    padding: 1rem;
    color: var(--colors-skeleton-1-boundary);
    font-size: 0.8rem;
    font-family: var(--font-family-code);
  }

  .btn-got-it {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--colors-palette-gray-200);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .btn-got-it:hover {
    border-color: var(--colors-skeleton-1-contrast);
  }

  @media (max-width: 640px) {
    .title { font-size: var(--font-size-xl); }
    .table { gap: 0.375rem; }
    .table-row {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      padding: 0.75rem 0.875rem;
    }
    .table-person { font-size: 0.6rem; margin-bottom: 0.125rem; }
    .table-form { font-size: var(--font-size-base); font-family: var(--font-family-sans-text); font-weight: 600; }
    .table-gloss { font-size: 0.8rem; font-family: var(--font-family-sans-text); }
    .table-audio { align-self: flex-start; margin-top: 0.25rem; }
    .contrastive { flex-direction: column; }
    .contrast-divider { width: 100%; height: 1px; }
  }
</style>

<script>
  const SKELETONS = [0, 1, 2, 3, 4];
  const ROLES = ["primary", "secondary", "accent", "info", "success", "warning", "danger"];
  const STATES = ["base", "hover", "active"];

  const THEME_GROUPS = [
    { label: "theme", keys: ["primary", "secondary", "accent"] },
    { label: "system", keys: ["info", "success", "warning", "danger", "error"] },
  ];
  const COMPAT_PARTS = ["surface", "contrast", "boundary"];

  let activeSkeleton = $state(1);
</script>

<div class="decorum">
  <h1 class="title">decorum</h1>

  <section class="section">
    <h2 class="heading">skeletons</h2>
    <div class="skeleton-grid">
      {#each SKELETONS as level}
        <div
          class="skeleton-card"
          class:active={activeSkeleton === level}
          onclick={() => activeSkeleton = level}
          role="button"
          tabindex="0"
          style="
            background: var(--colors-skeleton-{level}-surface);
            color: var(--colors-skeleton-{level}-contrast);
            border-color: var(--colors-skeleton-{level}-boundary);
          "
        >
          <span class="skeleton-label">skeleton {level}</span>
          <div class="swatch-row">
            <div class="swatch" style="background: var(--colors-skeleton-{level}-surface);" title="surface"></div>
            <div class="swatch" style="background: var(--colors-skeleton-{level}-contrast);" title="contrast"></div>
            <div class="swatch" style="background: var(--colors-skeleton-{level}-boundary);" title="boundary"></div>
          </div>
          <div class="role-grid">
            {#each ROLES as role}
              <div class="role-row">
                <span class="role-name">{role}</span>
                {#each STATES as state}
                  <div
                    class="swatch"
                    style="background: var(--colors-skeleton-{level}-{role}-{state});"
                    title="{role}-{state}"
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
          <div class="role-row">
            <span class="role-name">error</span>
            <div class="swatch" style="background: var(--colors-skeleton-{level}-error-surface);" title="error-surface"></div>
            <div class="swatch" style="background: var(--colors-skeleton-{level}-error-contrast);" title="error-contrast"></div>
            <div class="swatch" style="background: var(--colors-skeleton-{level}-error-boundary);" title="error-boundary"></div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="section">
    <h2 class="heading">theme + system (compat aliases)</h2>
    {#each THEME_GROUPS as group}
      <h3 class="subheading">{group.label}</h3>
      <div class="compat-grid">
        {#each group.keys as key}
          <div class="compat-card">
            <span class="compat-label">{group.label}.{key}</span>
            <div class="swatch-row">
              {#each COMPAT_PARTS as part}
                <div class="compat-swatch-wrap">
                  <div
                    class="swatch large"
                    style="background: var(--colors-{group.label}-{key}-{part});"
                    title="{part}"
                  ></div>
                  <span class="swatch-label">{part}</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </section>

  <section class="section">
    <h2 class="heading">live specimen</h2>
    <div class="specimen-row">
      <button class="specimen-btn" style="
        background: var(--colors-theme-primary-surface);
        color: var(--colors-theme-primary-contrast);
        border: 1px solid var(--colors-theme-primary-boundary);
      ">Primary</button>
      <button class="specimen-btn" style="
        background: var(--colors-theme-secondary-surface);
        color: var(--colors-theme-secondary-contrast);
        border: 1px solid var(--colors-theme-secondary-boundary);
      ">Secondary</button>
      <button class="specimen-btn" style="
        background: var(--colors-theme-accent-surface);
        color: var(--colors-theme-accent-contrast);
        border: 1px solid var(--colors-theme-accent-boundary);
      ">Accent</button>
    </div>
    <div class="specimen-row">
      <div class="specimen-badge success">
        <span style="color: var(--colors-system-success-contrast);">SUCCESS</span>
      </div>
      <div class="specimen-badge error">
        <span style="color: var(--colors-system-error-contrast);">ERROR</span>
      </div>
      <div class="specimen-badge warning">
        <span style="color: var(--colors-system-warning-contrast);">WARNING</span>
      </div>
      <div class="specimen-badge info">
        <span style="color: var(--colors-system-info-contrast);">INFO</span>
      </div>
      <div class="specimen-badge danger">
        <span style="color: var(--colors-system-danger-contrast);">DANGER</span>
      </div>
    </div>
    <div class="specimen-card" style="
      background: var(--colors-skeleton-{activeSkeleton}-surface);
      color: var(--colors-skeleton-{activeSkeleton}-contrast);
      border: 1px solid var(--colors-skeleton-{activeSkeleton}-boundary);
    ">
      <p class="specimen-text">Text on skeleton-{activeSkeleton} surface</p>
      <p class="specimen-subtext">Secondary text with boundary border below</p>
      <hr class="specimen-hr" style="border-color: var(--colors-skeleton-{activeSkeleton}-boundary);" />
      <p class="specimen-correct" style="color: var(--colors-skeleton-{activeSkeleton}-success-base);">falamos</p>
      <p class="specimen-incorrect" style="color: var(--colors-skeleton-{activeSkeleton}-danger-base); text-decoration: line-through;">falam</p>
      <p class="specimen-primary" style="color: var(--colors-skeleton-{activeSkeleton}-primary-base);">primary accent text</p>
    </div>
  </section>
</div>

<style>
  :global(html), :global(body) {
    overflow: auto !important;
  }

  .decorum {
    min-height: 100vh;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    padding: 2rem;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 2rem;
    color: var(--colors-skeleton-0-primary-base);
  }

  .section { margin-bottom: 3rem; }

  .heading {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 1rem;
    color: var(--colors-skeleton-0-contrast);
  }

  .subheading {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 1.5rem 0 0.75rem;
    color: var(--colors-skeleton-0-boundary);
  }

  .skeleton-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .skeleton-card {
    flex: 1 1 180px;
    min-width: 180px;
    padding: 1rem;
    border: 1px solid;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, outline 0.15s;
  }

  .skeleton-card:hover { opacity: 0.9; }

  .skeleton-card.active {
    opacity: 1;
    outline: 2px solid var(--colors-skeleton-0-primary-base);
    outline-offset: 2px;
  }

  .skeleton-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    display: block;
    margin-bottom: 0.75rem;
  }

  .swatch-row {
    display: flex;
    gap: 4px;
    margin-bottom: 0.5rem;
  }

  .swatch {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .swatch.large {
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }

  .role-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .role-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .role-name {
    font-size: 9px;
    width: 56px;
    flex-shrink: 0;
    opacity: 0.6;
  }

  .compat-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .compat-card {
    padding: 0.75rem;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 6px;
    min-width: 140px;
  }

  .compat-label {
    font-size: 0.65rem;
    font-weight: 500;
    display: block;
    margin-bottom: 0.5rem;
    color: var(--colors-skeleton-1-contrast);
  }

  .compat-swatch-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .swatch-label {
    font-size: 8px;
    opacity: 0.5;
  }

  .specimen-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .specimen-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .specimen-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .specimen-badge.success { background: var(--colors-system-success-surface); }
  .specimen-badge.error { background: var(--colors-system-error-surface); }
  .specimen-badge.warning { background: var(--colors-system-warning-surface); }
  .specimen-badge.info { background: var(--colors-system-info-surface); }
  .specimen-badge.danger { background: var(--colors-system-danger-surface); }

  .specimen-card {
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
    max-width: 480px;
  }


  .specimen-text {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-sans-text);
    font-size: 0.9rem;
  }

  .specimen-subtext {
    margin: 0 0 0.75rem;
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .specimen-hr {
    border: none;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    margin: 0.75rem 0;
  }

  .specimen-correct {
    margin: 0.25rem 0;
    font-family: var(--font-family-serif-heading);
    font-size: 1.2rem;
  }

  .specimen-incorrect {
    margin: 0.25rem 0;
    font-family: var(--font-family-serif-heading);
    font-size: 1.2rem;
  }
</style>

<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Pictogram } from "@vivalence/drapes";
  import { dataspace } from "$client";

  let sessions = $state([]);
  const daemons = dataspace.daemon.$entities;

  onMount(async () => {
    const all = [];
    for (const daemon of dataspace.daemon.$entities.get()) {
      try {
        const found = await daemon.entities.session.find({}, { populate: ["mode", "intent"] });
        all.push(...found);
      } catch (e) {
        console.error(`[lobby] sessions for ${daemon.slug}`, e);
      }
    }
    sessions = all.slice(0, 10);
  });

  function modesFor(daemon) {
    return daemon.entities.mode.$entities.get().filter((m) => m.implements("SELFEVIDENT"));
  }

  function intentsFor(daemon) {
    return daemon.entities.intent.$entities.get();
  }

  async function enterMode(mode) {
    const session = await mode.daemon.entities.session.create({ mode: mode.id });
    goto(mode.link.branch(`/${session.id}`).absolute);
  }

  async function enterIntent(intent) {
    const session = await intent.mode.daemon.entities.session.create({
      mode: intent.mode.id,
      intent: intent.id,
    });
    goto(intent.link.branch(`/${session.id}`).absolute);
  }

  function resume(s) {
    const link = s.intent?.link ?? s.mode?.link;
    if (!link) return;
    goto(link.branch(`/${s.id}`).absolute);
  }
</script>

<div class="bsp-node" style="grid-template-rows: 1fr auto; height: 100dvh;">
  <div class="lobby">
    {#if sessions.length > 0}
      <div class="lobby-section">
        <div class="lobby-heading">recent</div>
        <div class="lobby-grid">
          {#each sessions as s (s.id)}
            <button class="lobby-door door-session" onclick={() => resume(s)}>
              <span class="door-daemon">{s.daemon?.slug}</span>
              <span class="door-label">{s.mode?.manifest?.name ?? s.mode?.slug ?? "—"}</span>
              {#if s.intent}
                <span class="door-sub">{s.intent?.name ?? s.intent?.slug}</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#each $daemons as daemon (daemon.slug)}
      <div class="lobby-section">
        <div class="lobby-heading">{daemon.manifest?.name ?? daemon.slug}</div>
        <div class="lobby-grid">
          {#each modesFor(daemon) as mode (mode.id)}
            <button class="lobby-door door-mode" onclick={() => enterMode(mode)}>
              <span class="door-tags">
                <span class="door-tag tag-selfevident-mode">selfevident mode</span>
                <span class="door-tag tag-type">{mode.type}</span>
              </span>
              <span class="door-label">{mode.manifest?.name ?? mode.slug}</span>
            </button>
          {/each}

          {#each intentsFor(daemon) as intent (intent.id)}
            <button class="lobby-door {intent.type === 'APPLICATIVE' ? 'door-intent-applicative' : 'door-intent-selfevident'}" onclick={() => enterIntent(intent)}>
              <span class="door-tags">
                <span class="door-tag {intent.type === 'APPLICATIVE' ? 'tag-applicative' : 'tag-selfevident-intent'}">{intent.type?.toLowerCase()} intent</span>
                <span class="door-tag tag-type">{intent.mode?.manifest?.name ?? intent.mode?.slug}</span>
              </span>
              <span class="door-label">{intent.name ?? intent.slug}</span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="ml">
    <button class="ml-logo" onclick={() => goto("/viva")}>
      <Pictogram src="/images/pictogram_viket/pic-vinca-viket_white.png" alt="lobby" size="sm" />
    </button>
    <span class="ml-spacer"></span>
  </div>
</div>

<style>
  .lobby {
    padding: 24px;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    overflow-y: auto;
  }

  .lobby-section {
    margin-bottom: 24px;
  }

  .lobby-heading {
    font-family: var(--font-family-code);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    margin-bottom: 8px;
  }

  .lobby-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }

  .lobby-door {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-family-code);
  }

  .lobby-door:hover {
    background: var(--colors-skeleton-2-surface);
    border-color: var(--colors-skeleton-2-contrast);
  }

  .door-daemon {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
  }

  .door-label {
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
  }

  .door-sub {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
  }

  .door-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .door-tag {
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 1px 5px;
    border-radius: 3px;
  }

  .tag-selfevident-mode {
    color: var(--colors-theme-primary-contrast);
    background: color-mix(in srgb, var(--colors-theme-primary-contrast) 15%, transparent);
  }

  .tag-selfevident-intent {
    color: #6ba3d6;
    background: color-mix(in srgb, #6ba3d6 15%, transparent);
  }

  .tag-applicative {
    color: #d6a36b;
    background: color-mix(in srgb, #d6a36b 15%, transparent);
  }

  .tag-type {
    color: var(--colors-skeleton-2-contrast);
    background: color-mix(in srgb, var(--colors-skeleton-2-contrast) 10%, transparent);
  }

  .door-mode {
    border-left: 3px solid var(--colors-theme-primary-contrast);
  }

  .door-intent-selfevident {
    border-left: 3px solid #6ba3d6;
  }

  .door-intent-applicative {
    border-left: 3px solid #d6a36b;
  }

  .door-session {
    border-left: 3px solid var(--colors-system-success-contrast, #4a4);
  }

  .ml {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px 0 0;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-1-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-contrast);
    user-select: none;
  }

  .ml-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 100%;
    flex-shrink: 0;
    background: none;
    border: none;
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    cursor: pointer;
    padding: 0;
    opacity: 0.4;
  }

  .ml-logo:hover {
    opacity: 1;
    background: var(--colors-skeleton-2-surface);
  }

  .ml-spacer {
    flex: 1;
  }
</style>

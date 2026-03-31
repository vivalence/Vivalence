<script>
  import { goto } from "$app/navigation";
  import { onMount, setContext } from "svelte";
  import { dataspace } from "$client";
  import { Terminal } from "@vivalence/html/typology";
  import Modeline from "./Modeline.svelte";

  const terminal = new Terminal();
  setContext("terminal", terminal);

  let threads = $state([]);
  const daemons = dataspace.daemon.$entities;

  onMount(async () => {
    const results = await Promise.all(
      dataspace.daemon.$entities.get().map((daemon) =>
        daemon.entities.thread
          .find({}, { populate: ["mode", "intent"] })
          .catch((e) => {
            console.error(`[lobby] threads for ${daemon.slug}`, e);
            return [];
          }),
      ),
    );
    threads = results.flat().slice(0, 10);
  });

  function navigableByType(daemon) {
    const modes = [...daemon.entities.mode.$entities.get()];
    const intents = [...daemon.entities.intent.$entities.get()];
    const groups = {};

    for (const m of modes) {
      const modeIntents = intents.filter((i) => i.mode?.id === m.id);
      const selfevident = m.implements("SELFEVIDENT");
      if (!selfevident && modeIntents.length === 0) continue;

      const type = m.type?.toLowerCase() ?? "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push({ mode: m, intents: modeIntents, selfevident });
    }

    return Object.entries(groups);
  }

  async function enterMode(mode) {
    const thread = await mode.daemon.entities.thread.create({ mode: mode.id });
    goto(mode.link.branch(`/${thread.id}`).absolute);
  }

  async function enterIntent(intent) {
    const thread = await intent.mode.daemon.entities.thread.create({
      mode: intent.mode.id,
      intent: intent.id,
    });
    goto(intent.link.branch(`/${thread.id}`).absolute);
  }

  function resume(s) {
    const link = s.intent?.link ?? s.mode?.link;
    if (!link) return;
    goto(link.branch(`/${s.id}`).absolute);
  }
</script>

<div class="viva-frame" style="height: 100%;">
  <div class="viva-surface lobby">
    {#if threads.length > 0}
      <div class="lobby-section">
        <div class="lobby-heading">recent</div>
        <div class="lobby-grid">
          {#each threads as s (s.id)}
            <button class="lobby-door door-thread" onclick={() => resume(s)}>
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
        {#each navigableByType(daemon) as [type, entries]}
          <div class="lobby-type">{type}</div>
          {@const singles = entries.filter(e => !e.selfevident && e.intents.length === 1)}
          {@const multis = entries.filter(e => e.selfevident || e.intents.length > 1)}

          {#if singles.length}
            <div class="lobby-grid">
              {#each singles as { mode, intents } (mode.id)}
                <button class="lobby-door door-intent" onclick={() => enterIntent(intents[0])}>
                  <span class="door-label">{intents[0].name ?? intents[0].slug}</span>
                  <span class="door-sub">{mode.manifest?.name ?? mode.slug}</span>
                </button>
              {/each}
            </div>
          {/if}

          {#each multis as { mode, intents, selfevident } (mode.id)}
            <div class="lobby-mode-heading">{mode.manifest?.name ?? mode.slug}</div>
            <div class="lobby-grid">
              {#if selfevident}
                <button class="lobby-door door-mode" onclick={() => enterMode(mode)}>
                  <span class="door-label">{mode.manifest?.name ?? mode.slug}</span>
                </button>
              {/if}
              {#each intents as intent (intent.id)}
                <button class="lobby-door door-intent" onclick={() => enterIntent(intent)}>
                  <span class="door-label">{intent.name ?? intent.slug}</span>
                </button>
              {/each}
            </div>
          {/each}
        {/each}
      </div>
    {/each}
  </div>

  <div class="viva-controls">
    <Modeline />
  </div>
</div>

<style>
  .lobby {
    padding: 24px;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
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
    margin-bottom: 12px;
  }

  .lobby-type {
    font-family: var(--font-family-code);
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-theme-primary-contrast);
    margin: 16px 0 8px;
  }

  .lobby-mode-heading {
    font-family: var(--font-family-code);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--colors-skeleton-2-contrast);
    margin: 8px 0 4px 2px;
  }

  .lobby-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }

  .lobby-door {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
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

  .door-mode {
    border-left: 3px solid var(--colors-theme-primary-contrast);
  }

  .door-intent {
    border-left: 3px solid var(--colors-skeleton-1-boundary);
  }

  .door-label {
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
  }

  .door-daemon {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
  }

  .door-sub {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
  }

  .door-thread {
    border-left: 3px solid var(--colors-system-success-contrast, #4a4);
  }

</style>

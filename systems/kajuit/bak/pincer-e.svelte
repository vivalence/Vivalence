<script>
  import { getContext } from "svelte";
  import { THREAD, QUARTERS } from "$client";

  const threadInstance = getContext(THREAD);
  const quartersInstance = getContext(QUARTERS);

  let thread = $state(null);
  threadInstance.$current.subscribe((value) => { thread = value; });

  async function toggleInsitu() {
    if (!thread) return;
    const hasInsitu = thread.traits.includes("INSITU");
    const newTraits = hasInsitu
      ? thread.traits.filter((t) => t !== "INSITU")
      : [...thread.traits, "INSITU"];

    thread.traits = newTraits;

    try {
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, { traits: newTraits });
    } catch (error) {
      console.error("[Panel E] INSITU toggle failed:", error);
      thread.traits = hasInsitu ? thread.traits : thread.traits.filter((t) => t !== "INSITU");
    }

    const terminal = quartersInstance.$terminal.get();
    if (terminal) {
      const current = terminal.$thread.get();
      terminal.$thread.set(null);
      terminal.$thread.set(current);
    }
  }

  async function toggleAudio() {
    if (!thread) return;
    const current = thread.trait?.INSITU?.audio?.enabled ?? false;
    const next = !current;
    const patch = {
      trait: {
        ...thread.trait,
        INSITU: {
          ...(thread.trait?.INSITU ?? {}),
          audio: { ...(thread.trait?.INSITU?.audio ?? {}), enabled: next },
        },
      },
    };

    thread.trait = patch.trait;

    try {
      await thread.daemon.entities.thread.updateOne({ id: thread.id }, patch);
    } catch (error) {
      console.error("[Panel E] audio toggle failed:", error);
      thread.trait = {
        ...thread.trait,
        INSITU: {
          ...(thread.trait?.INSITU ?? {}),
          audio: { ...(thread.trait?.INSITU?.audio ?? {}), enabled: current },
        },
      };
      return;
    }

    const terminal = quartersInstance.$terminal.get();
    if (terminal && thread.traits.includes("INSITU")) {
      const currentThread = terminal.$thread.get();
      terminal.$thread.set(null);
      terminal.$thread.set(currentThread);
    }
  }
</script>

<div class="panel">
  {#if thread}
    <div class="section">
      <div class="thread-header">
        <span class="thread-name">{thread.trait?.LABELED?.name ?? thread.name ?? "—"}</span>
        <span class="thread-id">{thread.id?.slice(0, 8) ?? ""}</span>
      </div>
      {#if thread.mode}
        <div class="mode-line">
          <span class="mode-label">mounted</span>
          <span class="mode-type">{thread.mode.type}</span>
          <span class="mode-label">declares</span>
        </div>
        {#if thread.mode.traits?.length}
          <div class="pills">
            {#each thread.mode.traits as trait}
              <span class="pill">{trait}</span>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <div class="divider"></div>

    <div class="section">
      <span class="section-label">TRAITS</span>
      <div class="trait-list">
        {#each thread.traits as trait}
          {#if trait === "INSITU"}
            <button
              class="trait-row insitu"
              class:active={true}
              onclick={toggleInsitu}
            >
              <span class="trait-pip active"></span>
              <span class="trait-name">INSITU</span>
              <span class="trait-hint">session toggle</span>
            </button>
          {:else}
            <div class="trait-row">
              <span class="trait-pip"></span>
              <span class="trait-name">{trait}</span>
            </div>
          {/if}
        {/each}

        {#if !thread.traits.includes("INSITU") && thread.mode?.traits?.includes("CONVERSATIONAL")}
          <button class="trait-row insitu inactive" onclick={toggleInsitu}>
            <span class="trait-pip"></span>
            <span class="trait-name">INSITU</span>
            <span class="trait-hint">click to engage</span>
          </button>
        {/if}

        {#if thread.mode?.traits?.includes("VOCALIZED")}
          {@const audioEnabled = thread.trait?.INSITU?.audio?.enabled ?? false}
          <button class="trait-row insitu" class:active={audioEnabled} onclick={toggleAudio}>
            <span class="trait-pip" class:active={audioEnabled}></span>
            <span class="trait-name">AUDIO</span>
            <span class="trait-hint">{audioEnabled ? "mic + speaker engaged" : "click to engage voice"}</span>
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <span class="label">E</span>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .section {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .divider {
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
    margin: 0 12px;
  }
  .thread-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .thread-name {
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-0-contrast);
    letter-spacing: 0.3px;
  }
  .thread-id {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    letter-spacing: 0.3px;
  }
  .mode-line {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    letter-spacing: 0.3px;
  }
  .mode-type {
    color: var(--colors-skeleton-1-contrast);
  }
  .mode-label {
    color: var(--colors-skeleton-2-contrast);
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .pill {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.4px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-1-contrast);
    padding: 1px 6px;
    border-radius: 2px;
  }
  .section-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.8px;
    color: var(--colors-skeleton-2-contrast);
  }
  .trait-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .trait-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    background: none;
    border: none;
    text-align: left;
    cursor: default;
    font-family: var(--font-family-code);
  }
  .trait-row.insitu {
    cursor: pointer;
  }
  .trait-row.insitu:hover .trait-name {
    color: var(--colors-skeleton-0-primary-base);
  }
  .trait-pip {
    width: 6px;
    height: 6px;
    border-radius: 1px;
    background: var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }
  .trait-pip.active {
    background: var(--colors-skeleton-0-primary-base);
  }
  .trait-name {
    font-size: var(--font-size-sm);
    letter-spacing: 0.4px;
    color: var(--colors-skeleton-1-contrast);
  }
  .trait-row.insitu.active .trait-name,
  .trait-row.insitu:not(.inactive) .trait-name {
    color: var(--colors-skeleton-0-primary-base);
  }
  .trait-row.insitu.inactive .trait-name {
    color: var(--colors-skeleton-2-contrast);
  }
  .trait-hint {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    letter-spacing: 0.3px;
    margin-left: auto;
  }
  .label {
    display: block;
    text-align: center;
    margin-top: 40%;
    font-size: 36px;
    font-weight: 900;
    opacity: 0.4;
    user-select: none;
  }
</style>

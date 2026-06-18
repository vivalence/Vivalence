<script>
  import { getContext } from "svelte";
  import Row from "./Row.svelte";
  // import { traits } from "@vivalence/kajuit";
  import { TERMINALS, BRIDGE /*, BOX */ } from "$client";

  let { thread } = $props();

  const STATES = ["IDLE", "OPENING", "LIVE", "CLOSING", "CLOSED", "ERROR"];

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  // const box = getContext(BOX);
  // const microphone = box.device.microphone;
  // const speaker = box.device.speaker;

  // let micClaimed = $state(microphone.claimed);
  // let micPaused = $state(microphone.paused);
  // let micSpeaking = $state(microphone.speaking);
  // let micPermission = $state(microphone.permission);
  // let spkClaimed = $state(speaker.claimed);
  // let spkPlaying = $state(speaker.playing);
  // microphone.$claimed.subscribe((v) => (micClaimed = v));
  // microphone.$paused.subscribe((v) => (micPaused = v));
  // microphone.$speaking.subscribe((v) => (micSpeaking = v));
  // microphone.$permission.subscribe((v) => (micPermission = v));
  // speaker.$claimed.subscribe((v) => (spkClaimed = v));
  // speaker.$playing.subscribe((v) => (spkPlaying = v));

  let conversationState = $state("—");
  let busy = $state(false);
  let threadTraits = $state([]);
  let conversation = $state(null);
  let terminal = $state(null);
  let composer = $state({ enterSends: true, density: "comfortable" });

  $effect(() => {
    if (!thread?.$traits) {
      threadTraits = [];
      return;
    }
    threadTraits = thread.traits;
    return thread.$traits.subscribe((value) => (threadTraits = value));
  });

  $effect(() => {
    if (!thread?.$conversation) {
      conversation = null;
      return;
    }
    conversation = thread.conversation;
    return thread.$conversation.subscribe((value) => (conversation = value));
  });

  let stateTeardown = null;
  $effect(() => {
    stateTeardown?.();
    stateTeardown = null;
    if (!conversation?.$state) {
      conversationState = "—";
      return;
    }
    conversationState = conversation.$state.get() ?? "—";
    stateTeardown = conversation.$state.subscribe((value) => (conversationState = value ?? "—"));
    return () => stateTeardown?.();
  });

  $effect(() => {
    if (!terminals?.$active) return;
    const sub = terminals.$active.subscribe((next) => {
      terminal = next;
    });
    composer = bridge.composer;
    const composerTeardown = bridge.$composer.subscribe((value) => (composer = value ?? composer));
    return () => {
      sub();
      composerTeardown();
    };
  });

  let engaged = $derived(threadTraits.includes("CONVERSATIONAL"));
  let canEngage = $derived(thread?.mode?.traits?.includes?.("CONVERSATIONAL") ?? false);
  let statusKind = $derived(
    conversationState === "LIVE" ? "live"
    : conversationState === "OPENING" ? "pulling"
    : conversationState === "ERROR" ? "error"
    : "stub",
  );

  async function toggle() {
    if (!thread || busy) return;
    busy = true;
    try {
      // if (engaged) await traits.thread.conversational.release(thread);
      // else await traits.thread.conversational.engage(thread);
    } finally {
      busy = false;
    }
  }

  function setComposer(patch) {
    bridge.composer = { ...bridge.composer, ...patch };
  }
</script>

<Row
  letter="C"
  name="conversational"
  status={engaged ? conversationState.toLowerCase() : "—"}
  {statusKind}>
  <div class="kv">
    <span class="k">state</span>
    <span class="states">
      {#each STATES as s, i}
        <span class="state" class:on={s === conversationState}>{s.toLowerCase()}</span>
        {#if i < STATES.length - 1}<span class="arrow">→</span>{/if}
      {/each}
    </span>
  </div>

  <!--
  <div class="kv">
    <span class="k">voice</span>
    <span class="v">
      mic: {micClaimed
        ? (micPaused ? "paused" : (micSpeaking ? "speaking" : "ready"))
        : (micPermission === "denied" ? "denied" : "—")}
      · spk: {spkClaimed ? (spkPlaying ? "playing" : "ready") : "—"}
    </span>
  </div>
  -->


  <div class="kv">
    <span class="k">enter</span>
    <span class="enter-row">
      <button
        type="button"
        class="enter-mode"
        class:on={composer.enterSends}
        disabled={!terminal}
        title="press enter to send, shift+enter for newline"
        onclick={() => setComposer({ enterSends: true })}>send</button>
      <button
        type="button"
        class="enter-mode"
        class:on={!composer.enterSends}
        disabled={!terminal}
        title="press enter for newline, shift+enter to send"
        onclick={() => setComposer({ enterSends: false })}>newline</button>
    </span>
  </div>

  {#snippet footer()}
    <button class="btn" class:engaged onclick={toggle} disabled={!canEngage || busy}>
      {engaged ? "release" : "engage"}
    </button>
  {/snippet}
</Row>

<style>
  .kv {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .k {
    min-width: 60px;
    opacity: 0.5;
    padding-top: 2px;
  }
  .states {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 3px;
    flex-wrap: wrap;
    font-size: var(--font-size-2xs);
  }
  .state {
    opacity: 0.4;
    text-transform: lowercase;
  }
  .state.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .arrow {
    opacity: 0.25;
    font-size: var(--font-size-2xs);
  }
  .enter-row {
    display: inline-flex;
    gap: 3px;
  }
  .enter-mode {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    text-transform: lowercase;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    border-radius: 2px;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.16s, color 0.16s, border-color 0.16s;
  }
  .enter-mode:hover:not(:disabled) {
    opacity: 0.85;
    color: var(--colors-skeleton-0-primary-base);
  }
  .enter-mode.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .enter-mode:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
  .btn {
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.7;
  }
  .btn:hover:not(:disabled) {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .btn.engaged {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .btn.engaged:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
</style>

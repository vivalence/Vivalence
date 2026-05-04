<script>
  import { traits } from "@vivalence/kajuit";

  let { thread } = $props();

  let conversationState = $state("—");
  let threadTraits = $state([]);
  let busy = $state(false);
  let conversation = $state(null);

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

  let engaged = $derived(threadTraits.includes("CONVERSATIONAL"));
  let canEngage = $derived(thread?.mode?.traits?.includes?.("CONVERSATIONAL") ?? false);
  let live = $derived(conversationState === "LIVE");
  let opening = $derived(conversationState === "OPENING");

  async function toggle() {
    if (!thread || busy) return;
    busy = true;
    try {
      if (engaged) await traits.thread.conversational.release(thread);
      else await traits.thread.conversational.engage(thread);
    } finally {
      busy = false;
    }
  }
</script>

{#if canEngage}
  <button
    class="widget"
    class:engaged
    class:live
    class:opening
    title={engaged ? `conversation · ${conversationState.toLowerCase()}` : "engage conversation"}
    onclick={toggle}
    disabled={busy}>
    <span class="pip"></span>
    <span class="label">{engaged ? conversationState.toLowerCase() : "engage"}</span>
  </button>
{/if}

<style>
  .widget {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 3px;
    background: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: lowercase;
    line-height: 1;
    cursor: pointer;
    opacity: 0.75;
    transition: border-color 0.12s, opacity 0.12s;
  }
  .widget:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .widget:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .pip {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    flex-shrink: 0;
  }
  .widget.engaged {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 60%, transparent);
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
  .widget.live .pip {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .widget.opening .pip {
    background: var(--colors-skeleton-0-warning-base);
    animation: pip-pulse 0.8s ease-in-out infinite;
  }
  @keyframes pip-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .widget.engaged:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .widget.engaged:hover:not(:disabled) .pip {
    background: var(--colors-skeleton-0-danger-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-danger-base);
  }
</style>

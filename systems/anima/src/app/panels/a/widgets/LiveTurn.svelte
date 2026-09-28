<script>
  import { Status } from "@vivalence/drapes";
  import Turn from "./Turn.svelte";

  let {
    item = null,
    agent = "agent",
    word = "thinking",
    elapsed = "",
    thinking = null,
    launches = [],
    onlaunch,
    onfold,
  } = $props();

  const SILENT = {
    kind: "turn",
    turn: { role: "assistant" },
    date: null,
    text: "",
    think: "",
    tools: [],
    failures: 0,
    artifacts: [],
    buffers: [],
    verdict: null,
  };
</script>

<div class="live-turn">
  <Turn item={item ?? SILENT} {agent} {thinking} {launches} {onlaunch} {onfold}>
    {#snippet status()}
      <span class="live-dots"><i></i><i></i><i></i></span>
      <span class="live-spacer"></span>
      <Status tone="primary" {word} pulse live />
      <span class="live-elapsed">{elapsed}</span>
    {/snippet}
  </Turn>
  {#if !item}<span class="live-label">{word}</span>{/if}
</div>

<style>
  .live-turn {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    overflow-anchor: none;
  }
  .live-dots {
    display: inline-flex;
    gap: 3px;
  }
  .live-dots i {
    width: 4px;
    height: 4px;
    border-radius: var(--shape-radius-full);
    background: var(--signal-primary);
    animation: live-pulse 1.2s ease-in-out infinite;
  }
  .live-dots i:nth-child(2) {
    animation-delay: 0.2s;
  }
  .live-dots i:nth-child(3) {
    animation-delay: 0.4s;
  }
  .live-spacer {
    flex: 1;
  }
  .live-elapsed {
    font-variant-numeric: tabular-nums;
    color: var(--text-light);
  }
  .live-label {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--signal-primary-ink);
  }
  .live-turn :global(.turn-text > :last-child)::after {
    content: "";
    display: inline-block;
    width: 7px;
    height: 13px;
    margin-left: 2px;
    vertical-align: -2px;
    background: var(--signal-primary);
    animation: live-pulse 0.8s ease-in-out infinite;
  }
  @keyframes live-pulse {
    0%,
    80%,
    100% {
      opacity: 0.3;
    }
    40% {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .live-dots i {
      animation: none;
    }
  }
</style>

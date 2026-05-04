<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE } from "$client";

  let { rect } = $props();

  const lighthouse = getContext(LIGHTHOUSE);

  let lighthouseStatus = $state(lighthouse.status.code === "IDLE" ? "ok" : "ok");
  let daemonStatus = $state("ok");
  let daemonLatency = $state(0);

  lighthouse.$status.subscribe((status) => {
    if (status.code === "OFFLINE") lighthouseStatus = "down";
    else if (status.code === "ERROR" || status.code === "SESSION_EXPIRED") lighthouseStatus = "down";
    else if (status.code === "VERIFYING" || status.code === "REFRESHING") lighthouseStatus = "lag";
    else lighthouseStatus = "ok";
  });

  lighthouse.$daemons.subscribe((daemons) => {
    if (!daemons.length) { daemonStatus = "down"; return; }
    daemonStatus = daemons.reduce((worst, daemon) => {
      const state = daemon.connection?.$state?.get?.() ?? "IDLE";
      if (state === "ERROR") return "down";
      if (state === "LOADING" && worst !== "down") return "lag";
      return worst;
    }, "ok");
  });

  const lighthouseTooltip = $derived(
    `lighthouse: ${lighthouseStatus}\n` +
    `status: ${lighthouse.status.code}`
  );
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
>
  <div class="scanline"></div>
  <div class="endcap"></div>
  <div class="population">
    <div class="slot" title={lighthouseTooltip}>
      <span class="status-dot lg" data-status={lighthouseStatus}></span>
      <span class="glyph">L</span>
    </div>
    <div class="rule"></div>
    <div class="slot" title={"daemon · " + daemonStatus}>
      <span class="status-dot lg" data-status={daemonStatus}></span>
      <span class="glyph">D</span>
    </div>
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-0-boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .scanline {
    position: absolute;
    left: 0;
    right: 0;
    top: 45px;
    height: 8px;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--colors-skeleton-0-primary-base) 50%,
      transparent 100%
    );
    opacity: 0.18;
    animation: heartbeat 4s linear infinite;
  }
  @keyframes heartbeat {
    0%   { transform: translateY(0); opacity: 0; }
    20%  { opacity: 0.18; }
    100% { transform: translateY(calc(100vh - 100px)); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .scanline { display: none; }
  }
  .endcap {
    position: absolute;
    left: 50%;
    top: 47px;
    transform: translateX(-50%);
    width: 12px;
    height: 1px;
    background: var(--colors-skeleton-0-primary-base);
    opacity: 0.55;
    pointer-events: none;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    padding: 56px 0 14px;
    pointer-events: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
  }
  .slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .glyph {
    font-size: 8px;
    line-height: 1;
    letter-spacing: 0.06em;
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.55;
    text-transform: uppercase;
  }
  .rule {
    width: 16px;
    height: 1px;
    background: var(--colors-skeleton-0-boundary);
    opacity: 0.35;
  }
  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-success-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-success-base);
    transition: background 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .status-dot.lg {
    width: 9px;
    height: 9px;
    box-shadow: 0 0 6px var(--colors-skeleton-0-success-base);
  }
  .status-dot[data-status="lag"] {
    background: var(--colors-skeleton-0-warning-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-warning-base);
  }
  .status-dot.lg[data-status="lag"] {
    box-shadow: 0 0 6px var(--colors-skeleton-0-warning-base);
  }
  .status-dot[data-status="down"] {
    background: var(--colors-skeleton-0-danger-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-danger-base);
  }
  .status-dot.lg[data-status="down"] {
    box-shadow: 0 0 8px var(--colors-skeleton-0-danger-base);
  }
</style>

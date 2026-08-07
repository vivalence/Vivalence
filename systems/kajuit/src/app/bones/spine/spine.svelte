<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE } from "$client";

  let { rect } = $props();

  const lighthouse = getContext(LIGHTHOUSE);

  let lighthouseStatus = $state("ok");

  lighthouse.$status.subscribe((status) => {
    if (status.code === "OFFLINE") lighthouseStatus = "down";
    else if (status.code === "ERROR" || status.code === "SESSION_EXPIRED") lighthouseStatus = "down";
    else if (status.code === "VERIFYING" || status.code === "REFRESHING") lighthouseStatus = "lag";
    else lighthouseStatus = "ok";
  });

  // One dot per daemon (replaces the old worst-of-all aggregate). health: ok=healthy,
  // down=error/connection-error, lag=anything else (unavailable, loading, unknown).
  function dotsFor(daemons) {
    return daemons.map((daemon) => {
      const reflection = daemon.status?.reflection ?? {};
      const code = (reflection.code ?? "").toLowerCase();
      const state = daemon.connection?.$state?.get?.() ?? "IDLE";
      const health = code === "error" || state === "ERROR" ? "down" : code === "healthy" ? "ok" : "lag";
      const hint = [daemon.slug, `status · ${code || "unknown"}`];
      if (health === "ok") {
        const modes = daemon.entities?.mode?.$entities.get().length ?? 0;
        const threads = daemon.entities?.thread?.$entities.get().length ?? 0;
        hint.push(`modes · ${modes}`, `threads · ${threads}`);
      }
      const error = reflection.error?.message ?? reflection.error;
      if (error) hint.push(`error · ${error}`);
      return {
        slug: daemon.slug,
        glyph: daemon.slug.charAt(0).toUpperCase(),
        health,
        hint: hint.join("\n"),
      };
    });
  }

  let daemonDots = $state(dotsFor(lighthouse.$daemons.get()));
  lighthouse.$daemons.subscribe((daemons) => (daemonDots = dotsFor(daemons)));

  const lighthouseTooltip = $derived(
    `lighthouse · ${lighthouseStatus}\n` + `status · ${lighthouse.status.code}\n` + `daemons · ${daemonDots.length}`,
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
    {#each daemonDots as dot (dot.slug)}
      <div class="slot" title={dot.hint}>
        <span class="status-dot" data-status={dot.health}></span>
        <span class="glyph">{dot.glyph}</span>
      </div>
    {/each}
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
    /* .bone/.population are pointer-events:none so the rail doesn't block content behind it;
       re-enable here so the dots are hoverable and their title tooltips show. */
    pointer-events: auto;
  }
  .glyph {
    font-size: var(--font-size-2xs);
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
    background: var(--signal-positive);
    box-shadow: 0 0 4px color-mix(in srgb, var(--signal-positive) 55%, transparent);
    transition: background 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .status-dot.lg {
    width: 9px;
    height: 9px;
    box-shadow: 0 0 6px color-mix(in srgb, var(--signal-positive) 55%, transparent);
  }
  .status-dot[data-status="lag"] {
    background: var(--signal-caution);
    box-shadow: 0 0 6px color-mix(in srgb, var(--signal-caution) 55%, transparent);
  }
  .status-dot.lg[data-status="lag"] {
    box-shadow: 0 0 6px color-mix(in srgb, var(--signal-caution) 55%, transparent);
  }
  .status-dot[data-status="down"] {
    background: var(--signal-negative);
    box-shadow: 0 0 6px color-mix(in srgb, var(--signal-negative) 55%, transparent);
  }
  .status-dot.lg[data-status="down"] {
    box-shadow: 0 0 8px color-mix(in srgb, var(--signal-negative) 55%, transparent);
  }
</style>

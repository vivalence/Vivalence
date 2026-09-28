<script>
  import { getContext } from "svelte";
  import { TONES, settled, stores } from "@vivalence/anima";
  import { Pip } from "@vivalence/drapes";
  import { LIGHTHOUSE } from "$client";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));

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
        health,
        hint: hint.join("\n"),
      };
    });
  }

  const PIPS = { ok: "success", lag: "primary", down: "danger" };

  let daemonDots = $state(dotsFor(lighthouse.$daemons.get()));
  let live = $state({});
  let open = $state(false);

  const watch = (daemons) =>
    daemons
      .map((daemon) =>
        daemon.entities?.activity?.$entities?.subscribe((rows) => {
          live = { ...live, [daemon.slug]: rows.filter((row) => !settled(row.status)).map((row) => row.status) };
        }),
      )
      .filter(Boolean);

  let watched = [];
  lighthouse.$daemons.subscribe((daemons) => {
    daemonDots = dotsFor(daemons);
    watched.forEach((off) => off());
    live = {};
    watched = watch(daemons);
  });

  const lighthouseTooltip = $derived(
    `lighthouse · ${lighthouseStatus}\n` + `status · ${lighthouse.status.code}\n` + `daemons · ${daemonDots.length}`,
  );
</script>

<div
  data-zone="0"
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div
    class="population"
    style:flex-direction={axis}
    style:padding={axis === "row" ? "0 14px 0 56px" : "56px 0 14px"}>
    <button
      class="lighthouse {lighthouseStatus}"
      class:open
      class:across={axis === "row"}
      title={lighthouseTooltip}
      onclick={() => (open = !open)}>
      {#each daemonDots as dot (dot.slug)}
        <span class="daemon" title={dot.hint}>
          <Pip size={open ? 8 : 6} tone={PIPS[dot.health]} pulse={dot.health === "lag"} />
          {#if open && live[dot.slug]?.length}
            <span class="ticks">
              {#each live[dot.slug] as code, index (index)}
                <span class="tick {TONES[code] ?? 'none'}"></span>
              {/each}
            </span>
          {/if}
        </span>
      {/each}
    </button>
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--surface);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    pointer-events: none;
    color: var(--text-strong);
  }
  .lighthouse {
    --lighthouse-tone: var(--signal-positive);
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 2px;
    min-width: 12px;
    min-height: 12px;
    padding: 3px;
    border: none;
    border-radius: var(--shape-radius-xs);
    background: none;
    box-shadow: inset 0 0 0 2px var(--lighthouse-tone);
    cursor: pointer;
    pointer-events: auto;
    transition:
      padding 0.35s cubic-bezier(0.5, 1.6, 0.4, 1),
      gap 0.35s cubic-bezier(0.5, 1.6, 0.4, 1);
  }
  .lighthouse.across {
    grid-template-columns: none;
    grid-template-rows: repeat(2, auto);
    grid-auto-flow: column;
  }
  .lighthouse.lag {
    --lighthouse-tone: var(--signal-primary);
    animation: lighthouse-checking 1.6s ease-in-out infinite;
  }
  .lighthouse.down {
    --lighthouse-tone: var(--signal-negative);
  }
  .lighthouse.open {
    grid-template-columns: auto;
    gap: 9px;
    padding: 8px 6px;
    box-shadow: inset 0 0 0 var(--size-ring) var(--lighthouse-tone);
  }
  .lighthouse.open.across {
    grid-template-columns: none;
    grid-template-rows: auto;
    padding: 6px 8px;
  }
  .daemon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .ticks {
    display: grid;
    grid-template-columns: repeat(3, 4px);
    gap: 1px;
  }
  .tick {
    width: 4px;
    height: 3px;
    background: var(--boundary);
  }
  .tick.idle {
    background: var(--text-light);
  }
  .tick.primary {
    background: var(--signal-primary);
  }
  .tick.positive {
    background: var(--signal-positive);
  }
  .tick.caution {
    background: var(--signal-caution);
  }
  .tick.negative {
    background: var(--signal-negative);
  }
  @keyframes lighthouse-checking {
    50% {
      opacity: 0.55;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .lighthouse,
    .lighthouse.lag {
      transition: none;
      animation: none;
    }
  }
</style>

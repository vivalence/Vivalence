<script>
  import { getContext } from "svelte";
  import { TONES, settled, stores } from "@vivalence/anima";
  import { Float, Key, Pip, place } from "@vivalence/drapes";
  import { LIGHTHOUSE } from "$client";
  import { project } from "../../panels/f/widgets/activity.js";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));

  const lighthouse = getContext(LIGHTHOUSE);

  const STANDING = {
    VERIFIED: ["verified", "positive"],
    AUTHENTICATED: ["verified", "positive"],
    REFRESHED: ["verified", "positive"],
    AUTHENTICATING: ["checking", "primary"],
    VERIFYING: ["checking", "primary"],
    REFRESHING: ["checking", "primary"],
    POPULATING: ["populating", "primary"],
    OFFLINE: ["unreachable", "negative"],
    ERROR: ["unreachable", "negative"],
    SESSION_EXPIRED: ["expired", "idle"],
    LOGGED_OUT: ["signed out", "idle"],
    IDLE: ["idle", "idle"],
  };
  const PIPS = { positive: "success", primary: "primary", caution: "warning", negative: "danger" };
  const SAID = { SIGSTOP: "pause", SIGCONT: "resume", SIGTERM: "stop" };
  const LEAVE = 180;

  const remote = lighthouse.connection.url.href;
  const host = URL.canParse(remote) ? new URL(remote).host : remote;

  let standing = $state(STANDING.IDLE);
  let daemons = $state.raw(lighthouse.$daemons.get());
  let live = $state.raw({});
  let chosen = $state(null);
  let hovered = $state(null);
  let pinned = $state(null);
  let bone = $state(null);
  let leaving = null;

  lighthouse.$status.subscribe(
    (status) => (standing = STANDING[status.code] ?? [String(status.code).replaceAll("_", " ").toLowerCase(), "idle"]),
  );

  const watch = (list) =>
    list
      .map((daemon) =>
        daemon.entities?.activity?.$entities?.subscribe((rows) => {
          live = { ...live, [daemon.slug]: rows.filter((row) => !settled(row.status)) };
        }),
      )
      .filter(Boolean);

  let watched = [];
  lighthouse.$daemons.subscribe((list) => {
    daemons = list;
    watched.forEach((off) => off());
    live = {};
    watched = watch(list);
  });

  const idOf = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? null;
  const codeOf = (daemon) =>
    daemon.connection?.$state?.get?.() === "ERROR" ? "error" : (daemon.status?.reflection?.code ?? "").toLowerCase() || "unknown";
  const toneOf = (code) => (code === "healthy" ? "positive" : code === "mounting" || code === "unknown" ? "primary" : "negative");
  const threadsOf = (daemon) => daemon.entities?.thread?.$entities.get() ?? [];
  const offered = (daemon) =>
    (daemon.entities?.mode?.$entities.get() ?? [])
      .filter((mode) => mode.implements("application") || mode.implements("conversational"))
      .map((mode) => mode.slug);

  const activity = (daemon, row) => {
    const projected = project(row);
    const thread = threadsOf(daemon).find((candidate) => candidate.id === idOf(row.thread));
    return {
      id: row.id,
      name: projected.path,
      code: projected.code,
      tone: TONES[projected.code] ?? "none",
      thread: thread?.label?.name ?? thread?.mode?.slug ?? String(idOf(row.thread) ?? "—").slice(-8),
      send: (signal) => row.stdin?.[signal]?.(`user pressed ${SAID[signal]}`),
    };
  };

  const dots = $derived(
    daemons.map((daemon) => {
      const code = codeOf(daemon);
      return { daemon, slug: daemon.slug, code, tone: toneOf(code), acts: (live[daemon.slug] ?? []).map((row) => activity(daemon, row)) };
    }),
  );

  const open = $derived(chosen ?? standing[0] === "verified");
  const card = $derived(hovered && !pinned ? (dots.find((dot) => dot.slug === hovered.slug) ?? null) : null);
  const detail = $derived(pinned ? (dots.find((dot) => dot.slug === pinned) ?? null) : null);
  const running = $derived(detail?.acts.find((act) => act.code === "RUNNING") ?? null);
  const paused = $derived(detail?.acts.find((act) => act.code === "PAUSED") ?? null);
  const named = $derived(`${lighthouse.manifest?.slug ?? host} · ${standing[0]}`);

  const sub = (dot) => [...offered(dot.daemon), `${threadsOf(dot.daemon).length} threads`].join(" · ");
  const facts = (dot) => [
    ["lighthouse", [lighthouse.manifest?.slug, host].filter(Boolean).join(" · ")],
    ["modes", offered(dot.daemon).join(" · ") || "—"],
    ["threads", String(threadsOf(dot.daemon).length)],
  ];

  const lower = () => rect.top + rect.height / 2 > window.innerHeight / 2;
  const side = () => (axis === "row" ? (lower() ? "above" : "below") : "after");

  function toggle() {
    chosen = !open;
    hovered = null;
    pinned = null;
  }

  function enter(event, slug) {
    if (pinned) return;
    clearTimeout(leaving);
    hovered = { slug, at: event.currentTarget.getBoundingClientRect() };
  }

  function leave() {
    clearTimeout(leaving);
    leaving = setTimeout(() => (hovered = null), LEAVE);
  }

  const keep = () => clearTimeout(leaving);

  function pin(event, slug) {
    if (!open) return;
    event.stopPropagation();
    clearTimeout(leaving);
    hovered = null;
    pinned = slug;
  }

  function close() {
    chosen = false;
    pinned = null;
    hovered = null;
  }

  $effect(() => {
    const outside = (event) => {
      if (pinned || !open || event.target.closest?.("[data-sp3]")) return;
      chosen = false;
      hovered = null;
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  });

  const portal = (node) => {
    document.body.appendChild(node);
    return { destroy: () => node.remove() };
  };

  const beside = (at) =>
    axis === "row"
      ? { left: at.left - 8, right: at.left - 8, top: rect.top, bottom: rect.top + rect.height }
      : { left: rect.left, right: rect.left + rect.width, top: at.top - 6, bottom: at.top - 6 };

  function placed(node, at) {
    const settle = (spot) => {
      const { left, top } = place(beside(spot), node.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight }, side());
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
    };
    settle(at);
    return { update: settle };
  }
</script>

<div
  data-zone="0"
  class="bone"
  bind:this={bone}
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div
    class="population"
    style:flex-direction={axis}
    style:padding={axis === "row" ? "0 14px 0 56px" : "56px 0 14px"}>
    <div
      class="lighthouse {standing[1]}"
      class:open
      class:checking={standing[0] === "checking"}
      class:across={axis === "row"}
      data-sp3
      role="button"
      tabindex="0"
      title={named}
      onclick={toggle}
      onkeydown={(event) => (event.key === "Enter" || event.key === " ") && toggle()}>
      {#each dots as dot (dot.slug)}
        <span
          class="daemon"
          role="button"
          tabindex="-1"
          aria-label="{dot.slug} · {dot.code}"
          onclick={(event) => pin(event, dot.slug)}
          onkeydown={(event) => event.key === "Enter" && pin(event, dot.slug)}
          onmouseenter={(event) => enter(event, dot.slug)}
          onmouseleave={leave}>
          <Pip size={open ? 8 : 6} tone={PIPS[dot.tone]} pulse={dot.code === "mounting"} />
          {#if open && dot.acts.length}
            <span class="ticks">
              {#each dot.acts as act (act.id)}
                <span class="tick {act.tone}"></span>
              {/each}
            </span>
          {/if}
        </span>
      {:else}
        <span class="dash">—</span>
      {/each}
    </div>
  </div>
</div>

{#if card}
  <div
    class="spine-card"
    data-zone="0"
    data-sp3
    role="tooltip"
    use:portal
    use:placed={hovered.at}
    onmouseenter={keep}
    onmouseleave={leave}>
    <div class="spine-head">
      <Pip size={7} tone={PIPS[card.tone]} pulse={card.code === "mounting"} />
      <span class="spine-name">{card.slug}</span>
      <span class="spine-state {card.tone}">{card.code}</span>
    </div>
    <span class="spine-sub">{sub(card)}</span>
    {#each card.acts as act (act.id)}
      <div class="spine-act">
        <i class="tick wide {act.tone}"></i>
        <span class="spine-act-name">{act.name}</span>
        <span class="spine-state {act.tone}">{act.code.toLowerCase()}</span>
      </div>
    {:else}
      <span class="spine-sub">no live activities</span>
    {/each}
  </div>
{/if}

{#if detail}
  <Float anchor={bone} zone="0" side={side()} onclose={close}>
    <div class="spine-pinned" data-sp3>
      <div class="spine-head">
        <Pip size={8} tone={PIPS[detail.tone]} pulse={detail.code === "mounting"} />
        <span class="spine-label">daemon</span>
        <span class="spine-title">{detail.slug}</span>
        <span class="spine-label spine-state {detail.tone}">{detail.code}</span>
      </div>
      <div class="spine-facts">
        {#each facts(detail) as [key, value] (key)}
          <span class="spine-key">{key}</span>
          <span class="spine-value" title={value}>{value}</span>
        {/each}
      </div>
      {#if standing[0] === "verified"}
        <div class="spine-rule">
          <span class="spine-label">connections</span>
          <i></i>
          <span class="spine-sub">{named}</span>
        </div>
        <div class="spine-rows">
          {#each dots as dot (dot.slug)}
            <button class="spine-row" class:picked={dot.slug === detail.slug} onclick={() => (pinned = dot.slug)}>
              <Pip size={7} tone={PIPS[dot.tone]} pulse={dot.code === "mounting"} />
              <span class="spine-row-name">{dot.slug}</span>
              <span class="spine-row-live" class:busy={dot.acts.length}>{dot.acts.length || "—"}</span>
            </button>
          {/each}
        </div>
      {:else}
        <div class="spine-off">lighthouse {standing[0]} · no live connection</div>
      {/if}
      {#if detail.acts.length}
        <div class="spine-rule">
          <span class="spine-label">activities</span>
          <i></i>
        </div>
        <div class="spine-acts">
          {#each detail.acts as act (act.id)}
            <div class="spine-kid">
              <Pip size={6} tone={PIPS[act.tone] ?? "muted"} pulse={act.code === "RUNNING"} />
              <span class="spine-kid-names">
                <span class="spine-kid-name">{act.name}</span>
                <span class="spine-sub">{act.thread} · {act.code.toLowerCase()}</span>
              </span>
              {#if act.code === "RUNNING"}
                <Key size="mini" label="pause" title="SIGSTOP" onclick={() => act.send("SIGSTOP")} />
                <Key size="mini" tone="negative" label="stop" title="SIGTERM" onclick={() => act.send("SIGTERM")} />
              {:else if act.code === "PAUSED"}
                <Key size="mini" tone="primary" label="resume" title="SIGCONT" onclick={() => act.send("SIGCONT")} />
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      <div class="spine-verbs">
        {#if running}<Key size="mini" tone="negative" label="stop" title="SIGTERM" onclick={() => running.send("SIGTERM")} />{/if}
        {#if paused}<Key size="mini" tone="primary" label="resume" title="SIGCONT" onclick={() => paused.send("SIGCONT")} />{/if}
        <Key size="mini" label="close" onclick={() => (pinned = null)} />
      </div>
    </div>
  </Float>
{/if}

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
    --lighthouse-tone: var(--text-light);
    display: grid;
    grid-template-columns: repeat(2, 6px);
    gap: 2px;
    justify-items: center;
    align-items: start;
    min-width: 12px;
    min-height: 12px;
    padding: 3px;
    border-radius: var(--shape-radius-xs);
    box-shadow: inset 0 0 0 2px var(--lighthouse-tone);
    cursor: pointer;
    pointer-events: auto;
    transition:
      gap 0.35s cubic-bezier(0.5, 1.6, 0.4, 1),
      padding 0.35s cubic-bezier(0.5, 1.6, 0.4, 1),
      box-shadow 0.2s;
  }
  .lighthouse.across {
    grid-template-columns: none;
    grid-template-rows: repeat(2, 6px);
    grid-auto-flow: column;
  }
  .lighthouse.positive {
    --lighthouse-tone: var(--signal-positive);
  }
  .lighthouse.primary {
    --lighthouse-tone: var(--signal-primary);
  }
  .lighthouse.negative {
    --lighthouse-tone: var(--signal-negative);
  }
  .lighthouse.checking {
    animation: lighthouse-checking 1.2s ease-in-out infinite;
  }
  .lighthouse.open {
    grid-template-columns: 20px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
  }
  .lighthouse.across .daemon {
    flex-direction: row;
  }
  .dash {
    grid-column: span 2;
    grid-row: span 2;
    width: 14px;
    height: 14px;
    display: grid;
    place-items: center;
    font-family: var(--font-family-code);
    font-size: 8px;
    line-height: 1;
    color: var(--text-muted);
  }
  .ticks {
    display: grid;
    grid-template-columns: repeat(3, 4px);
    gap: 2px;
  }
  .lighthouse.across .ticks {
    grid-template-columns: none;
    grid-template-rows: repeat(3, 4px);
    grid-auto-flow: column;
  }
  .tick {
    width: 4px;
    height: 3px;
    border-radius: 1px;
    background: var(--text-light);
  }
  .lighthouse.across .tick {
    width: 3px;
    height: 4px;
  }
  .tick.wide {
    flex: none;
    width: 8px;
    height: 3px;
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
  .spine-card {
    position: fixed;
    z-index: 61;
    box-sizing: border-box;
    width: 210px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px 12px;
    background: var(--surface-lift);
    color: var(--text-strong);
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
    font-family: var(--font-family-code);
    font-size: 10.5px;
    text-align: left;
    cursor: default;
  }
  .spine-head {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .spine-name {
    font-weight: 700;
    color: var(--text-strong);
  }
  .spine-state {
    margin-left: auto;
    color: var(--text-light);
  }
  .spine-state.primary {
    color: var(--signal-primary-ink);
  }
  .spine-state.positive {
    color: var(--signal-positive-ink);
  }
  .spine-state.caution {
    color: var(--signal-caution-ink);
  }
  .spine-state.negative {
    color: var(--signal-negative-ink);
  }
  .spine-sub {
    font-size: 9.5px;
    color: var(--text-light);
  }
  .spine-act {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .spine-act-name {
    flex: 1;
    min-width: 0;
    color: var(--text-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spine-pinned {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-family-code);
  }
  .spine-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .spine-title {
    min-width: 0;
    font-family: var(--font-family-sans-heading);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spine-facts {
    display: grid;
    grid-template-columns: 70px minmax(0, 1fr);
    gap: 4px 10px;
    font-size: 11px;
  }
  .spine-key {
    color: var(--text-light);
  }
  .spine-value {
    min-width: 0;
    color: var(--text-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spine-rule {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spine-rule i {
    flex: 1;
    height: 1px;
    background: var(--boundary);
  }
  .spine-rows,
  .spine-acts {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .spine-row {
    display: grid;
    grid-template-columns: 8px minmax(0, 1fr) 40px;
    gap: 8px;
    align-items: center;
    min-height: 24px;
    padding: 0 6px;
    border: none;
    border-radius: var(--shape-radius-key);
    background: transparent;
    font-family: var(--font-family-code);
    font-size: 10.5px;
    text-align: left;
    cursor: pointer;
  }
  .spine-row:hover {
    background: var(--surface-sunk);
  }
  .spine-row.picked {
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-primary);
  }
  .spine-row-name {
    min-width: 0;
    color: var(--text-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spine-row-live {
    text-align: right;
    color: var(--text-light);
  }
  .spine-row-live.busy {
    color: var(--signal-primary-ink);
  }
  .spine-off {
    padding: 14px 8px;
    border-radius: var(--shape-radius-key);
    background: var(--surface-sunk);
    text-align: center;
    font-size: 10.5px;
    color: var(--text-light);
  }
  .spine-kid {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 0 4px 0 8px;
    border-radius: var(--shape-radius-key);
    font-size: 11px;
  }
  .spine-kid:hover {
    background: var(--surface-sunk);
  }
  .spine-kid-names {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .spine-kid-name {
    color: var(--text-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spine-verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  @keyframes lighthouse-checking {
    50% {
      opacity: 0.25;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .lighthouse,
    .lighthouse.checking {
      transition: none;
      animation: none;
    }
  }
</style>

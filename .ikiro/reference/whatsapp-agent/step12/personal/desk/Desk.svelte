<script>
  const { terminal, buffer } = $props();
  const mode = buffer.mode;
  const threads = terminal.client.runtime.entities.thread.$entities;
  const turns = terminal.client.runtime.entities.turn.$entities;
  const seat = terminal.$thread;

  const DAY = 86400000;
  const DAYS = 14;

  let settings = $state(null);
  let fault = $state(null);
  let now = $state(Date.now());

  $effect(() => {
    mode.call.settings({}).then(
      (held) => (settings = held),
      (error) => (fault = error.message),
    );
    mode.entities.thread.find({});
    mode.entities.turn.find({});
    const unsubscribe = mode.entities.turn.subscribe({});
    const clock = setInterval(() => (now = Date.now()), 30000);
    return () => {
      unsubscribe();
      clearInterval(clock);
    };
  });

  const at = (entity) => new Date(entity.createdAt).getTime();

  const said = (turn) =>
    turn.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ");

  const carried = (turn) =>
    turn.parts
      .filter((part) => part.type !== "text")
      .map((part) => part.type)
      .join(" · ");

  const ago = (time) => {
    const minutes = Math.round((now - time) / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes} m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
    return `${Math.round(minutes / 1440)} d`;
  };

  const clock = (time) =>
    new Date(time).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const span = (seconds) => (seconds % 3600 ? `${seconds / 60} min` : `${seconds / 3600} h`);

  const spoken = $derived(
    $turns
      .filter((turn) => turn.thread.mode === mode)
      .toSorted((first, second) => at(first) - at(second)),
  );
  const heard = $derived(spoken.filter((turn) => turn.role === "user" && turn.meta?.provider));
  const replies = $derived(spoken.filter((turn) => turn.role === "assistant" && said(turn)));
  const listed = $derived(
    $threads
      .filter((thread) => thread.mode === mode)
      .map((thread) => {
        const own = spoken.filter((turn) => turn.thread === thread);
        const last = own.findLast((turn) => said(turn));
        return {
          thread,
          turns: own.length,
          last,
          touched: own.length ? at(own.at(-1)) : at(thread),
          platforms: [...new Set(own.flatMap((turn) => turn.meta?.provider?.platform ?? []))],
        };
      })
      .toSorted((first, second) => second.touched - first.touched),
  );
  const wire = $derived(spoken.filter((turn) => turn.thread === $seat).toReversed());
  const days = $derived(
    Array.from({ length: DAYS }, (unused, index) => {
      const from = new Date(now).setHours(0, 0, 0, 0) - (DAYS - 1 - index) * DAY;
      const within = (turn) => at(turn) >= from && at(turn) < from + DAY;
      return { from, heard: heard.filter(within).length, replies: replies.filter(within).length };
    }),
  );
  const peak = $derived(Math.max(1, ...days.map((day) => Math.max(day.heard, day.replies))));
</script>

<div class="desk">
  <header>
    <div class="title">
      <h1>{mode.name}</h1>
      <span class="reference">{mode.type}/{mode.slug}</span>
    </div>
    {#if settings}
      <dl class="settings">
        <div><dt>owner</dt><dd>{settings.user}</dd></div>
        <div>
          <dt>platforms</dt>
          <dd>
            {#each settings.platforms as platform (platform)}
              <span class="chip">{platform}</span>
            {/each}
          </dd>
        </div>
        <div><dt>new thread after</dt><dd>{span(settings.idle)} of silence, or /new</dd></div>
      </dl>
    {:else if fault}
      <p class="fault">settings unread: {fault}</p>
    {/if}
  </header>

  <section class="tiles">
    <div class="tile"><b>{listed.length}</b><span>threads</span></div>
    <div class="tile"><b>{heard.length}</b><span>heard</span></div>
    <div class="tile"><b>{replies.length}</b><span>replies</span></div>
    <div class="tile">
      <b>{heard.length ? ago(at(heard.at(-1))) : "—"}</b><span>since last heard</span>
    </div>
  </section>

  <section class="days" aria-label="messages per day, last {DAYS} days">
    {#each days as day (day.from)}
      <div class="day" title="{clock(day.from)} · {day.heard} heard · {day.replies} replies">
        <i class="heard" style:height="{(day.heard / peak) * 100}%"></i>
        <i class="replies" style:height="{(day.replies / peak) * 100}%"></i>
      </div>
    {/each}
  </section>
  <p class="legend"><i class="heard"></i> heard <i class="replies"></i> replies · {DAYS} days</p>

  <div class="columns">
    <section>
      <h2>threads</h2>
      {#if listed.length === 0}
        <p class="empty">
          Nothing heard yet. Message the number and the first thread appears here.
        </p>
      {/if}
      <ul class="threads">
        {#each listed as held (held.thread.id)}
          <li>
            <button
              class:on={held.thread === $seat}
              onclick={() => terminal.setThread(held.thread)}
            >
              <span class="row">
                <b>{held.thread.word}</b>
                {#each held.platforms as platform (platform)}
                  <span class="chip">{platform}</span>
                {/each}
                <time>{ago(held.touched)}</time>
              </span>
              <span class="preview">{held.last ? said(held.last) : "no turns yet"}</span>
              <span class="count">{held.turns} turns · #{held.thread.id.slice(-6)}</span>
            </button>
          </li>
        {/each}
      </ul>
    </section>

    <section>
      <h2>wire {#if $seat}<span class="reference">#{$seat.id.slice(-6)}</span>{/if}</h2>
      {#if wire.length === 0}
        <p class="empty">Seat a thread to read what each turn arrived with.</p>
      {/if}
      <ol class="wire">
        {#each wire as turn (turn.id)}
          <li class={turn.role}>
            <div class="row">
              <b>{turn.role === "user" ? "heard" : turn.role}</b>
              {#if turn.meta?.provider}<span class="chip">{turn.meta.provider.platform}</span>{/if}
              <time>{clock(at(turn))}</time>
            </div>
            <p>{said(turn)}{#if carried(turn)}<span class="carried">{carried(turn)}</span>{/if}</p>
            {#if turn.meta?.provider}
              <details>
                <summary>{turn.meta.provider.name} · {turn.meta.provider.from}</summary>
                <pre>{JSON.stringify(turn.meta.provider, null, 2)}</pre>
              </details>
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  </div>
</div>

<style>
  .desk {
    min-height: 100%;
    box-sizing: border-box;
    padding: var(--size-space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--size-space-md);
    background: var(--plane);
    color: var(--text-ink);
    font-family: var(--font-family-sans-text);
    font-size: var(--size-type-sm);
    container-type: inline-size;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-space-md);
    justify-content: space-between;
  }
  .title { display: flex; align-items: baseline; gap: var(--size-space-sm); }
  h1 { margin: 0; font-family: var(--font-family-sans-heading); font-size: var(--size-type-xl); }
  h1, h2, b { color: var(--text-strong); }
  h2 {
    margin: 0 0 var(--size-space-sm);
    font-size: var(--size-type-xs);
    text-transform: var(--shape-label-case);
    letter-spacing: var(--shape-label-track);
  }
  .reference, time, .count, dt, .legend, .carried {
    color: var(--text-muted);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .carried { margin-left: var(--size-space-xs); }
  .settings { display: flex; flex-wrap: wrap; gap: var(--size-space-md); margin: 0; }
  dd { margin: 0; }
  .chip {
    padding: 0 var(--size-space-xs);
    border-radius: var(--shape-radius-pill);
    background: var(--signal-primary-tint);
    color: var(--signal-primary-ink);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .fault { margin: 0; color: var(--signal-negative-ink); }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--size-space-sm); }
  .tile {
    display: flex;
    flex-direction: column;
    padding: var(--size-space-sm) var(--size-space-md);
    border: 1px solid var(--boundary-soft);
    border-radius: var(--shape-radius-card);
    background: var(--plane-lift);
  }
  .tile b { font-size: var(--size-type-xl); font-variant-numeric: tabular-nums; }
  .tile span { color: var(--text-muted); font-size: var(--size-type-xs); }
  .days { display: flex; align-items: flex-end; gap: var(--size-space-2xs); height: 56px; }
  .day { flex: 1; height: 100%; display: flex; align-items: flex-end; gap: 1px; }
  .day i { flex: 1; min-height: 1px; border-radius: var(--shape-radius-2xs); }
  i.heard { background: var(--signal-primary); }
  i.replies { background: var(--signal-positive); }
  .legend { margin: 0; }
  .legend i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: var(--shape-radius-2xs);
  }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: var(--size-space-lg); }
  ul, ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  ul, ol { gap: var(--size-space-xs); }
  button {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--size-space-2xs);
    padding: var(--size-space-sm);
    border: 1px solid var(--boundary-soft);
    border-radius: var(--shape-radius-card);
    background: var(--plane-lift);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  button:hover { border-color: var(--boundary-strong); }
  button:focus-visible { outline: var(--size-ring) solid var(--control-focus); }
  button.on { border-color: var(--signal-primary); background: var(--control-selected); }
  .row { display: flex; align-items: center; gap: var(--size-space-xs); }
  .row time { margin-left: auto; }
  .preview, .wire p { margin: 0; overflow-wrap: anywhere; }
  .preview {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wire li { padding: var(--size-space-sm); border-left: 2px solid var(--boundary); }
  .wire li.user { border-left-color: var(--signal-primary); }
  .wire li.assistant { border-left-color: var(--signal-positive); }
  summary { cursor: pointer; color: var(--text-muted); font-size: var(--size-type-xs); }
  pre {
    margin: var(--size-space-xs) 0 0;
    padding: var(--size-space-sm);
    overflow-x: auto;
    border-radius: var(--shape-radius-xs);
    background: var(--plane-sunk);
    color: var(--text-code);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .empty { margin: 0; color: var(--text-muted); }
  @container (max-width: 640px) {
    .columns { grid-template-columns: 1fr; }
    .tiles { grid-template-columns: repeat(2, 1fr); }
  }
</style>

<script>
  import { getContext, untrack } from "svelte";
  import { chain, stores, dictation } from "@vivalence/anima";
  import { soma } from "@vivalence/typology";
  import { TERMINALS, BRIDGE, BOX } from "$client";
  import { Empty } from "@vivalence/drapes";
  import { TONES, loudest, roster as activityRoster } from "@vivalence/anima";
  import Composer from "./Composer.svelte";
  import DockHead from "./DockHead.svelte";
  import LiveTurn from "./LiveTurn.svelte";
  import Turn from "./Turn.svelte";
  import { stopper } from "./stop.svelte.js";
  import { spliceAt } from "./dictate.js";
  import { bufferLabel, enrich, project, turnClipboard, turnText, usages } from "./turns.js";

  let { thread, onconsole = null } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  const box = getContext(BOX);

  const turnsStore = chain(terminals, "$active", "$thread", "$turns");
  const modeStore = chain(terminals, "$active", "$thread", "$mode");
  const dockStore = chain(terminals, "$active", "$dock");
  const buffersStore = chain(terminals, "$active", "$thread", "$buffers");
  const traitStore = chain(terminals, "$active", "$thread", "$trait");
  const traitsStore = chain(terminals, "$active", "$thread", "$traits");
  const labelStore = chain(terminals, "$active", "$thread", "$label");
  const seatedStore = chain(terminals, "$active", "$buffer");
  const composerStore = bridge.$composer;

  let turns = $derived($turnsStore ?? []);
  let thinkMode = $derived($traitStore?.INTELLIGENT?.thinking);
  let harnessed = $derived($modeStore?.implements?.("HARNESSED") ?? false);
  let verbatim = $derived(harnessed && ($modeStore?.daemon?.cortex?.find({ type: "verbatim", via: "stream" }).length ?? 0) > 0);
  const tunable = $derived(($traitsStore ?? []).includes("INTELLIGENT"));
  const agent = $derived($labelStore?.name ?? "agent");

  let activities = $state([]);
  $effect(() => {
    if (!thread) return void (activities = []);
    untrack(() => control.disarm());
    return activityRoster(thread).subscribe((held) => (activities = held));
  });
  const activityCode = $derived(loudest(activities));
  const control = stopper(() => ({ activities, sending }));

  const recorder = dictation({ terminals, box });
  const dictating = recorder.$active;
  const level = box.device.microphone.$level;
  let anchor = 0;
  const listening = $derived($dictating !== "idle");
  let full = $derived($dockStore?.full ?? false);
  const side = $derived(stores.bridge.normalizeSide($dockStore?.side));

  let live = $state(null);
  let echo = $state(null);
  let sending = $state(false);
  let error = $state(null);

  let draft = $state("");
  let textareaEl = $state(null);
  let dockHeight = $state(0);
  let logEl = $state(null);
  let pinned = $state(true);
  let unread = $state(0);

  let metaOpen = $state(false);
  let picked = $state(null);
  let elapsed = $state(0);

  const CONSOLES = ["context", "meter", "activity"];

  function openConsole(name) {
    picked = picked === name ? null : name;
    onconsole?.(picked);
  }

  function toggleMeta() {
    metaOpen = !metaOpen;
    if (!metaOpen && picked) openConsole(picked);
  }

  function launch(row) {
    const terminal = terminals.active;
    const buffer = ($buffersStore ?? []).find((candidate) => candidate.id === row.id);
    if (!terminal || !buffer) return;
    terminal.buffer = buffer;
    if (full) stores.bridge.setDockFull(terminal.$dock, false);
  }

  function launchLabel(row) {
    const managed = ($buffersStore ?? []).find((candidate) => candidate.id === row.id) ?? row;
    return bufferLabel(managed);
  }

  const launches = (item) =>
    item.buffers.map((row) => {
      const managed = ($buffersStore ?? []).find((candidate) => candidate.id === row.id);
      return {
        id: row.id,
        label: launchLabel(row),
        line: [thread?.daemon?.slug, managed?.mode?.slug ?? thread?.mode?.slug].filter(Boolean).join(" › "),
        runnable: Boolean(managed),
        seated: !full && $seatedStore?.id === row.id,
      };
    });

  const coarsePointer = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  const enterSends = $derived(!coarsePointer && ($composerStore?.enterSends ?? true));
  const hint = $derived(coarsePointer ? "message…" : enterSends ? "message… (shift+enter for newline)" : "message… (enter for newline, shift+enter sends)");

  const isStreaming = $derived(!!live);
  const isThinking = $derived(sending && !live);
  const busy = $derived(sending || !!live);
  const showEcho = $derived(!!echo && !turns.some((t) => t.id === echo.id));

  const liveItem = $derived(live ? { ...project(live), turn: live, date: null } : null);
  const liveCall = $derived(liveItem?.tools.find((tool) => tool.status === "running")?.name ?? null);
  const liveWord = $derived(liveCall ? `calling ${liveCall}` : isStreaming ? "streaming" : "thinking");
  const elapsedLabel = $derived(`${elapsed.toFixed(1)}s`);

  $effect(() => {
    if (!busy) return;
    const begun = Date.now();
    elapsed = 0;
    const ticker = setInterval(() => (elapsed = (Date.now() - begun) / 1000), 100);
    return () => clearInterval(ticker);
  });

  function dictate() {
    anchor = textareaEl?.selectionStart ?? draft.length;
    recorder.start();
  }

  async function settle() {
    recorder.stop();
    await recorder.settled();
    const text = recorder.$committed.get();
    if (!text) return;
    const spliced = spliceAt(draft, anchor, text);
    draft = spliced.draft;
    requestAnimationFrame(() => {
      textareaEl?.focus();
      if (textareaEl) textareaEl.selectionStart = textareaEl.selectionEnd = spliced.caret;
    });
  }

  $effect(() => {
    const unswitch = chain(terminals, "$active", "$thread").subscribe(() => recorder.cancel());
    return () => {
      unswitch();
      recorder.cancel();
    };
  });

  async function send() {
    if (!draft.trim() || !harnessed || sending) return;
    control.disarm();
    const parts = [{ type: "text", text: draft.trim() }];
    draft = "";
    error = null;
    const id = crypto.randomUUID();
    echo = { id, role: "user", parts, createdAt: new Date().toISOString() };
    sending = true;
    pinned = true;
    pinBottom();
    textareaEl?.focus();

    try {
      for await (const turn of soma.scan(
        thread.mode.harness.dialogue.stream({ thread: thread.id, id, parts }),
      )) {
        live = { ...turn };
        pinBottom();
      }
    } catch (err) {
      error = err.message;
    } finally {
      live = null;
      echo = null;
      sending = false;
    }
  }


  function lastUserText() {
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      if (turns[i]?.role === "user") return turnText(turns[i]);
    }
    return null;
  }

  function recallLastUser() {
    const text = lastUserText();
    if (!text) return;
    draft = text;
    if (textareaEl) {
      textareaEl.focus();
      requestAnimationFrame(() => {
        textareaEl.selectionStart = textareaEl.selectionEnd = draft.length;
      });
    }
  }

  function onKey(event) {
    if (event.key === "Enter") {
      const wantsSend = enterSends ? !event.shiftKey : event.shiftKey;
      if (wantsSend) {
        event.preventDefault();
        send();
        return;
      }
    } else if (event.key === "ArrowUp" && draft === "") {
      event.preventDefault();
      recallLastUser();
    } else if (event.key === "Escape" && listening) {
      event.preventDefault();
      recorder.cancel();
    } else if (event.key === "Escape" && (isStreaming || sending || activities.length)) {
      event.preventDefault();
      control.stop();
    }
  }

  let copied = $state(null);

  async function toClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const done = document.execCommand ? document.execCommand("copy") : false;
    area.remove();
    return done;
  }

  async function copyTurn(turn, tools) {
    copied = (await toClipboard(turnClipboard(turn, tools))) ? turn.id : null;
    setTimeout(() => (copied = null), 1200);
  }

  function retryUser(turn) {
    const text = turnText(turn);
    if (!text) return;
    draft = text;
    send();
  }

  function isAtBottom(el) {
    if (!el) return true;
    const slack = 24;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - slack;
  }

  let lastScrollTop = 0;
  function onScroll() {
    if (!logEl) return;
    const top = logEl.scrollTop;
    if (isAtBottom(logEl)) {
      pinned = true;
      unread = 0;
    } else if (top < lastScrollTop) {
      pinned = false;
    }
    lastScrollTop = top;
  }

  let pinQueued = false;
  function pinBottom() {
    if (pinQueued) return;
    pinQueued = true;
    requestAnimationFrame(() => {
      pinQueued = false;
      if (pinned && logEl) logEl.scrollTop = logEl.scrollHeight;
    });
  }

  function repin() {
    pinned = true;
    pinBottom();
    unread = 0;
  }

  let lastCount = 0;
  $effect(() => {
    const len = enrichedTurns.filter((item) => item.kind === "turn").length + (isStreaming ? 1 : 0);
    if (pinned) pinBottom();
    else if (len > lastCount) unread = untrack(() => unread) + len - lastCount;
    lastCount = len;
  });

  $effect(() => {
    if (!logEl) return;
    const observer = new ResizeObserver(pinBottom);
    observer.observe(logEl);
    return () => observer.disconnect();
  });

  const spoken = $derived(showEcho ? [...turns, echo] : turns);
  const enrichedTurns = $derived(enrich(spoken));
  const spent = $derived(usages(enrichedTurns, spoken));
</script>

<div class="dock" class:full bind:clientHeight={dockHeight}>
  <DockHead
    label={$labelStore?.name ?? "session"}
    tone={activityCode === "NONE" ? (busy ? "primary" : harnessed ? "idle" : "none") : TONES[activityCode]}
    word={activityCode === "NONE" ? null : activityCode.toLowerCase()}
    pulse={busy || activityCode === "RUNNING"}
    {side}
    sides={stores.bridge.DOCK_SIDES}
    {full}
    meta={metaOpen}
    consoles={CONSOLES}
    {picked}
    onmeta={toggleMeta}
    onconsole={openConsole}
    onside={(name) => stores.bridge.setDockSide(terminals.active?.$dock, name)}
    onfull={() => stores.bridge.setDockFull(terminals.active?.$dock)}
    oncollapse={() => stores.bridge.setDockCollapsed(terminals.active?.$dock)} />

  <div class="dock-log" bind:this={logEl} onscroll={onScroll}>
    {#each enrichedTurns as item, index (item.id ?? item.turn?.id ?? index)}
      <Turn
        {item}
        {agent}
        thinking={thinkMode}
        usage={spent.get(item.turn?.id) ?? null}
        launches={item.kind === "turn" ? launches(item) : []}
        copied={item.kind === "turn" && copied === item.turn.id}
        onlaunch={launch}
        oncopy={copyTurn}
        onretry={retryUser}
        onfold={pinBottom} />
    {/each}

    {#if liveItem || isThinking}
      <LiveTurn
        item={liveItem}
        {agent}
        word={liveWord}
        elapsed={elapsedLabel}
        thinking={thinkMode}
        launches={liveItem ? launches(liveItem) : []}
        onlaunch={launch}
        onfold={pinBottom} />
    {/if}

    {#if !turns.length && !live && !isThinking}
      <div class="dock-begin"><Empty verb={harnessed ? "begin" : "no harness"} /></div>
    {/if}

    <div class="dock-anchor"></div>
  </div>

  <Composer
    bind:draft
    bind:field={textareaEl}
    {thread}
    {harnessed}
    {hint}
    ceiling={Math.max(112, Math.round(dockHeight * 0.6))}
    {error}
    {pinned}
    {unread}
    stoppable={sending || activities.length > 0}
    {sending}
    {control}
    {tunable}
    tune={$traitStore?.INTELLIGENT?.tune}
    {verbatim}
    {recorder}
    {level}
    coarse={coarsePointer}
    onkeydown={onKey}
    onsend={send}
    onpin={repin}
    ondictate={dictate}
    onsettle={settle} />
</div>

<style>
  .dock {
    --dock-gutter: 14px;
    --dock-head-gutter: 6px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: var(--surface-lift);
    color: var(--text-strong);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-sans-text);
  }
  .dock.full {
    --dock-gutter: clamp(24px, 8%, 120px);
    --dock-head-gutter: clamp(18px, 6%, 96px);
  }
  .dock-log {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px max(var(--dock-gutter), calc((100% - 640px) / 2)) 10px;
    font-size: var(--size-type-sm);
    line-height: var(--size-leading-loose);
  }
  .dock-begin {
    padding: 24px 0;
    overflow-anchor: none;
  }
  .dock-anchor {
    overflow-anchor: auto;
    height: 1px;
    flex-shrink: 0;
    margin-top: -14px;
  }
</style>

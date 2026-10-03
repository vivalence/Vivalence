<script>
  import { getContext, untrack } from "svelte";
  import { belt } from "@vivalence/typology";
  import { chain } from "@vivalence/anima";
  import { LIGHTHOUSE, TERMINALS } from "$client";
  import { logger } from "$telemetry";
  import Card from "./Card.svelte";
  import Row from "./Row.svelte";
  import Link from "./Link.svelte";
  import { drop, healthy, mint, named, pickDaemon, rename, seat } from "./threads.js";

  const SHOWN = 3;

  let { ...chrome } = $props();

  const lighthouse = getContext(LIGHTHOUSE);
  const terminals = getContext(TERMINALS);

  const daemons = lighthouse.$daemons;
  const active = chain(terminals, "$active", "$thread");

  let chosen = $state(null);
  let more = $state(false);
  let threads = $state.raw([]);
  let version = $state(0);

  const held = $derived(healthy($daemons));
  const daemon = $derived(pickDaemon(held, chosen, $active));
  const several = $derived(held.length > 1);

  const cycle = () => {
    if (!several) return;
    chosen = held[(held.indexOf(daemon) + 1) % held.length].slug;
  };

  $effect(() => {
    const current = daemon;
    if (!current) return void (threads = []);
    const tick = () => untrack(() => (version += 1));
    let labels = [];
    const recompute = () => {
      labels.forEach((off) => off());
      const rows = [...current.entities.thread.$entities.get()].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
      labels = rows.map((thread) => thread.$label.subscribe(tick));
      untrack(() => (threads = rows));
    };
    const off = current.entities.thread.$entities.subscribe(recompute);
    current.entities.thread.find({}, { populate: ["mode", "intent"] }).catch((error) => logger.entry(`threads/${current.slug}`).fault(error));
    return () => {
      off();
      labels.forEach((teardown) => teardown());
    };
  });

  const shown = $derived(more ? threads : threads.slice(0, SHOWN));
  const hidden = $derived(Math.max(0, threads.length - SHOWN));

  const label = (thread) => {
    void version;
    return named(thread);
  };

  const load = (thread) => seat(terminals, thread).catch((error) => logger.entry(`threads/${thread.id}`).fault(error));

  const template = $derived($active?.daemon === daemon ? ($active?.mode ?? null) : null);
  let minting = $state(false);
  async function fresh() {
    if (!daemon || !template || minting) return;
    minting = true;
    try {
      await mint(terminals, daemon, template);
    } catch (error) {
      logger.entry(`threads/${daemon.slug}/create`).fault(error);
    } finally {
      minting = false;
    }
  }

  let editing = $state(null);
  let draft = $state("");
  const edit = (event, thread) => {
    event.stopPropagation();
    editing = thread.id;
    draft = label(thread);
  };
  function commit(thread) {
    if (editing !== thread.id) return;
    editing = null;
    rename(thread, draft).catch((error) => logger.entry(`threads/${thread.id}/rename`).fault(error));
  }
  function onfield(event, thread) {
    event.stopPropagation();
    if (event.key === "Enter") commit(thread);
    else if (event.key === "Escape") editing = null;
  }
  const focus = (node) => node.focus();

  let doomed = $state(null);
  function remove(event, thread) {
    event.stopPropagation();
    if (doomed !== thread.id) return void (doomed = thread.id);
    doomed = null;
    drop(thread).catch((error) => logger.entry(`threads/${thread.id}/remove`).fault(error));
  }
</script>

<Card label="threads" meta={several ? null : (daemon?.slug ?? "no daemon")} {...chrome}>
  {#snippet action()}
    {#if template}
      <button class="card-chrome threads-new" disabled={minting} title="new thread · {template.name ?? template.slug} on {daemon.slug}" onclick={fresh}>+</button>
    {:else if daemon}
      <Link pane="modes">+ thread</Link>
    {/if}
    {#if several}
      <button class="threads-pick" title="next daemon · {held.length} healthy" onclick={cycle}>{daemon.slug} ⟳</button>
    {/if}
  {/snippet}
  <div class="threads card-list">
    {#each shown as thread (thread.id)}
      <Row selected={$active?.id === thread.id} title="load this thread" onclick={() => editing !== thread.id && load(thread)}>
        {#if editing === thread.id}
          <input
            class="threads-field"
            bind:value={draft}
            use:focus
            onclick={(event) => event.stopPropagation()}
            onkeydown={(event) => onfield(event, thread)}
            onblur={() => commit(thread)} />
        {:else}
          <span class="threads-label">{doomed === thread.id ? "delete?" : label(thread)}</span>
          <span class="card-dim">{belt.time.since(thread.updatedAt)}</span>
          <button class="threads-verb threads-rename" title="rename" onclick={(event) => edit(event, thread)}>✎</button>
        {/if}
        <button
          class="threads-verb"
          class:armed={doomed === thread.id}
          title={doomed === thread.id ? "press again to delete" : "delete thread"}
          onclick={(event) => remove(event, thread)}
          onpointerleave={() => doomed === thread.id && (doomed = null)}>✕</button>
      </Row>
    {:else}
      <span class="threads-empty card-dim">no threads</span>
    {/each}
    {#if hidden}
      <button class="threads-more" onclick={() => (more = !more)}>{more ? "less" : `+ ${hidden} more`}</button>
    {/if}
  </div>
</Card>

<style>
  .threads {
    padding: 6px;
  }
  .threads-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
  }
  .threads-field {
    flex: 1;
    min-width: 0;
    border: none;
    padding: 0;
    background: none;
    font: inherit;
    color: inherit;
    outline: none;
  }
  .threads-verb {
    flex: none;
    border: none;
    padding: 0 2px;
    background: none;
    font: inherit;
    color: var(--text-light);
    cursor: pointer;
    opacity: 0;
  }
  :global(.card-row:hover) .threads-verb,
  :global(.card-row:focus-within) .threads-verb,
  .threads-verb.armed {
    opacity: 1;
  }
  .threads-verb:hover,
  .threads-verb.armed {
    color: var(--signal-negative-ink);
  }
  .threads-rename:hover {
    color: inherit;
  }
  .threads-empty {
    padding: 0 8px;
  }
  .threads-pick {
    border: none;
    padding: 0;
    background: none;
    font: inherit;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    color: var(--text-light);
    cursor: pointer;
  }
  .threads-more {
    min-height: var(--size-row);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    font: inherit;
    font-size: 11px;
    color: var(--text-light);
    cursor: pointer;
  }
</style>

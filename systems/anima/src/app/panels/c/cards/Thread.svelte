<script>
  import { getContext } from "svelte";
  import { TONES, chain, loudest, roster } from "@vivalence/anima";
  import { Chip, Key, ToolRow } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import Card from "./Card.svelte";
  import Link from "./Link.svelte";
  import Labeled from "./traits/Labeled.svelte";
  import Masked from "./traits/Masked.svelte";
  import Aimed from "./traits/Aimed.svelte";
  import Queueing from "./traits/Queueing.svelte";

  const TRAITS = [
    { name: "LABELED", label: "labeled", toggleable: false, title: "set by the dossier · name + description" },
    { name: "MASKED", label: "masked", toggleable: false, title: "held while the application carries a schema · seeds buffers" },
    { name: "AIMED", label: "aimed", toggleable: true, title: "needs emitter branches · pull reads the mount" },
    { name: "QUEUEING", label: "queueing", toggleable: true, title: "needs aimed · dropping aimed drops it" },
  ];
  const EDITORS = { LABELED: Labeled, MASKED: Masked, AIMED: Aimed, QUEUEING: Queueing };

  let { ...chrome } = $props();

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const label = chain(terminals, "$active", "$thread", "$label");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const cursor = chain(terminals, "$active", "$buffer");

  let activities = $state.raw([]);
  $effect(() => {
    const current = $thread;
    if (!current) return void (activities = []);
    return roster(current).subscribe((held) => (activities = held));
  });
  const loud = $derived(loudest(activities));

  const ordered = $derived([...($buffers ?? [])].sort((first, second) => (first.index ?? 0) - (second.index ?? 0)));
  const seated = $derived(ordered.findIndex((buffer) => buffer.id === $cursor?.id));
  const position = $derived(`${seated < 0 ? "–" : seated + 1} / ${ordered.length}`);
  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);

  let open_ = $state(new Set());
  function toggleWidget(name) {
    open_ = open_.has(name) ? new Set([...open_].filter((entry) => entry !== name)) : new Set([name, ...open_]);
  }
  const active = (name) => $threadTraits?.includes(name) ?? false;
  function available(name) {
    if (name === "AIMED") return Object.keys($mode?.metadata?.emitter?.branches ?? {}).length > 0;
    if (name === "QUEUEING") return $threadTraits?.includes("AIMED") ?? false;
    if (name === "MASKED") return active("MASKED");
    return true;
  }
  const chipMark = (trait) => (!trait.toggleable ? null : active(trait.name) ? "×" : available(trait.name) ? "+" : null);

  async function toggleTrait(name) {
    const current = $thread;
    if (!current) return;
    const has = current.traits.includes(name);
    let traits = has ? current.traits.filter((trait) => trait !== name) : [...current.traits, name];
    if (name === "AIMED" && has) traits = traits.filter((trait) => trait !== "QUEUEING");
    await current.daemon.entities.thread.updateOne({ id: current.id }, { traits });
    current.traits = traits;
  }

  function pickTrait(trait) {
    const held = active(trait.name);
    if (!held && !available(trait.name)) return;
    if (!trait.toggleable) return toggleWidget(trait.name);
    if (!held && !open_.has(trait.name)) toggleWidget(trait.name);
    toggleTrait(trait.name);
  }

  function mark(event, name) {
    event.stopPropagation();
    toggleTrait(name);
  }

  let savingIntent = $state(false);
  async function saveIntent() {
    const current = $thread;
    if (!current || savingIntent) return;
    savingIntent = true;
    try {
      await current.daemon.entities.intent.create({
        slug: `thread-${current.id.slice(0, 8)}`,
        name: $label?.name ?? "thread",
        mode: current.mode?.id ?? current.mode,
        traits: [...current.traits],
        trait: { ...current.trait },
      });
    } finally {
      savingIntent = false;
    }
  }
</script>

<Card label="thread" {...chrome}>
  {#if !$thread}
    <div class="card-stack"><span class="card-dim">no thread · pick one in threads</span></div>
  {:else}
    <div class="card-stack">
      <div class="thread-crumb">
        <span class="card-dim thread-daemon">{$thread.daemon?.slug ?? "—"}</span>
        <span class="thread-step">›</span>
        <span class="thread-name">{$label?.name ?? "—"}</span>
        <span class="thread-spring"></span>
        <span class="card-dim thread-state"><span class="thread-dot {TONES[loud]}"></span>{loud === "NONE" ? "idle" : loud.toLowerCase()}</span>
      </div>

      <div class="thread-links">
        <Link pane="mode" title="open the mode card">mode · {$mode?.name ?? $mode?.slug ?? "—"}</Link>
        <Link pane="buffers" title="open the buffers card · the cursor lives there">buffers · {position}</Link>
        {#if harnessed}<Link pane="harness" title="open the harness card">harness</Link>{/if}
      </div>

      <div class="card-group">
        <span class="card-name">traits</span>
        <div class="card-keys">
          {#each TRAITS as trait (trait.name)}
            <Chip
              label={trait.label}
              active={active(trait.name)}
              mark={available(trait.name) || active(trait.name) ? (open_.has(trait.name) ? "▾" : "▸") : null}
              disabled={!available(trait.name) && !active(trait.name)}
              title={trait.title}
              onclick={() => pickTrait(trait)}
              onmark={() => toggleWidget(trait.name)} />
          {/each}
          <!--
          {#if $thread.intent}
            <Key size="mini" muted disabled label="intent" title={$thread.intent.name ?? $thread.intent.slug} />
          {:else}
            <Key size="mini" disabled={savingIntent} label={savingIntent ? "saving…" : "save as intent"} title="save this thread's traits as an intent" onclick={saveIntent} />
          {/if}
          -->
        </div>
        {#each [...open_] as name (name)}
          {@const trait = TRAITS.find((entry) => entry.name === name)}
          {@const Editor = EDITORS[name]}
          <ToolRow name={trait.label} status={active(name) ? "active" : "available"} tone={active(name) ? "primary" : "idle"} title="close the editor" open ontoggle={() => toggleWidget(name)}>
            {#snippet actions()}
              {#if chipMark(trait)}
                <Key tone="ghost" size="mini" square label={chipMark(trait)} title={chipMark(trait) === "×" ? "drop the trait" : "add the trait"} onclick={(event) => mark(event, name)} />
              {/if}
            {/snippet}
            <Editor thread={$thread} />
          </ToolRow>
        {/each}
      </div>

    </div>
  {/if}
</Card>

<style>
  .thread-crumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }
  .thread-daemon {
    font-size: 12px;
  }
  .thread-step {
    color: var(--text-muted);
  }
  .thread-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--text-strong);
  }
  .thread-spring {
    flex: 1;
    min-width: 0;
  }
  .thread-state {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .thread-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--text-muted);
  }
  .thread-dot.primary {
    background: var(--signal-primary);
  }
  .thread-dot.caution {
    background: var(--signal-caution);
  }
  .thread-dot.idle {
    background: var(--text-light);
  }
  .thread-links {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
  }
</style>

<script>
  import { getContext } from "svelte";
  import { TONES, chain, loudest, roster } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import { Chip, Empty, Key, Section, Status, Tag, ToolRow } from "@vivalence/drapes";
  import Tune from "../../widgets/Tune.svelte";
  import Labeled from "./widgets/Labeled.svelte";
  import Masked from "./widgets/Masked.svelte";
  import Aimed from "./widgets/Aimed.svelte";
  import Queueing from "./widgets/Queueing.svelte";

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const label = chain(terminals, "$active", "$thread", "$label");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const cursor = chain(terminals, "$active", "$buffer");

  const TRAITS = [
    { name: "LABELED", label: "labeled", toggleable: false, title: "set by the dossier · name + description" },
    { name: "MASKED", label: "masked", toggleable: false, title: "held while the application carries a schema · seeds buffers" },
    { name: "AIMED", label: "aimed", toggleable: true, title: "needs emitter branches · pull reads the mount" },
    { name: "QUEUEING", label: "queueing", toggleable: true, title: "needs aimed · dropping aimed drops it" },
    { name: "INTELLIGENT", label: "intelligent", toggleable: true, title: "tune · effort · rounds · thinking" },
  ];
  const EDITORS = { LABELED: Labeled, MASKED: Masked, AIMED: Aimed, QUEUEING: Queueing, INTELLIGENT: Tune };

  let open = $state(new Set([]));
  function toggleWidget(name) {
    open = open.has(name)
      ? new Set([...open].filter((entry) => entry !== name))
      : new Set([name, ...open]);
  }

  function active(name) {
    return $threadTraits?.includes(name) ?? false;
  }

  function available(name) {
    if (name === "AIMED") return Object.keys($mode?.metadata?.emitter?.branches ?? {}).length > 0;
    if (name === "QUEUEING") return $threadTraits?.includes("AIMED") ?? false;
    if (name === "MASKED") return active("MASKED");
    return true;
  }

  function chipMark(trait) {
    if (!trait.toggleable) return null;
    if (active(trait.name)) return "×";
    if (available(trait.name)) return "+";
    return null;
  }

  async function toggleTrait(name) {
    const current = terminals.active?.thread;
    if (!current) return;
    const has = current.traits.includes(name);
    let traits = has ? current.traits.filter((trait) => trait !== name) : [...current.traits, name];
    if (name === "AIMED" && has) traits = traits.filter((trait) => trait !== "QUEUEING");
    await current.daemon.entities.thread.updateOne({ id: current.id }, { traits });
    current.traits = traits;
  }

  function pick(trait) {
    const held = active(trait.name);
    if (!held && !available(trait.name)) return;
    if (!trait.toggleable) return toggleWidget(trait.name);
    if (!held && !open.has(trait.name)) toggleWidget(trait.name);
    toggleTrait(trait.name);
  }

  function mark(event, name) {
    event.stopPropagation();
    toggleTrait(name);
  }

  let activities = $state.raw([]);
  $effect(() => {
    const current = $thread;
    if (!current) return void (activities = []);
    return roster(current).subscribe((held) => (activities = held));
  });
  const loud = $derived(loudest(activities));

  const ordered = $derived([...($buffers ?? [])].sort((first, second) => (first.index ?? 0) - (second.index ?? 0)));
  const seated = $derived(ordered.findIndex((buffer) => buffer.id === $cursor?.id));

  // phase control + integrity moved OUT of the c-panel into the shoulder widgets (PhaseLever +
  // Integrity) — render-phase is shoulder territory, not trait-config territory.

  function labelText(value) {
    return (typeof value === "object" ? value?.name : value) ?? "—";
  }

  let savingIntent = $state(false);
  async function onSaveIntent() {
    const current = terminals.active?.thread;
    if (!current || savingIntent) return;
    savingIntent = true;
    try {
      await current.daemon.entities.intent.create({
        slug: `thread-${current.id.slice(0, 8)}`,
        name: labelText(current.label),
        mode: current.mode?.id ?? current.mode,
        traits: [...current.traits],
        trait: { ...current.trait },
      });
    } finally {
      savingIntent = false;
    }
  }
</script>

{#if !$thread}
  <Empty verb="no thread" trace="pick one in navigation" />
{:else}
  <div class="thread">
    <div class="thread-crumb">
      <span class="thread-daemon">{$thread.daemon?.slug ?? "—"}</span>
      <span class="thread-step">›</span>
      <span class="thread-mode">{$mode?.name ?? $mode?.slug ?? "—"}</span>
      {#if $mode?.type}<Tag>{$mode.type}</Tag>{/if}
      <Status tone={TONES[loud]} word={loud === "NONE" ? "idle" : loud.toLowerCase()} live={loud === "RUNNING"} pulse={loud === "RUNNING"} />
      <span class="thread-cursor">cursor {seated < 0 ? "–" : seated + 1}/{ordered.length}</span>
      <span class="thread-spring"></span>
      {#if $thread.intent}
        <Key size="mini" muted disabled={savingIntent} label="update intent" title={$thread.intent.name ?? $thread.intent.slug} />
      {:else}
        <Key size="mini" disabled={savingIntent} label={savingIntent ? "saving…" : "save as intent"} title="unsaved thread config" onclick={onSaveIntent} />
      {/if}
    </div>

    <div class="thread-part">
      <Section label="thread traits" count="{$threadTraits?.length ?? 0} on" />
      <div class="thread-chips">
        {#each TRAITS as trait (trait.name)}
          <Chip
            label={trait.label}
            active={active(trait.name)}
            mark={available(trait.name) || active(trait.name) ? (open.has(trait.name) ? "▾" : "▸") : null}
            disabled={!available(trait.name) && !active(trait.name)}
            title={trait.title}
            onclick={() => pick(trait)}
            onmark={() => toggleWidget(trait.name)} />
        {/each}
      </div>

      {#each [...open] as name (name)}
        {@const trait = TRAITS.find((entry) => entry.name === name)}
        {@const held = active(name)}
        {@const Editor = EDITORS[name]}
        <ToolRow
          name={trait.label}
          status={held ? "active" : "available"}
          tone={held ? "primary" : "idle"}
          title="close the editor"
          open
          ontoggle={() => toggleWidget(name)}>
          {#snippet actions()}
            {#if chipMark(trait)}
              <Key
                tone="ghost"
                size="mini"
                square
                label={chipMark(trait)}
                title={chipMark(trait) === "×" ? "drop the trait" : "add the trait"}
                onclick={(event) => mark(event, name)} />
            {/if}
          {/snippet}
          <Editor thread={$thread} />
        </ToolRow>
      {/each}
    </div>
  </div>
{/if}

<style>
  .thread {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    padding: 6px 4px 4px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-strong);
  }
  .thread-crumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    min-width: 0;
    padding-bottom: var(--size-depth);
  }
  .thread-daemon {
    font-weight: 600;
    color: var(--signal-primary-ink);
  }
  .thread-step {
    color: var(--text-muted);
  }
  .thread-mode {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .thread-cursor {
    color: var(--text-light);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .thread-spring {
    flex: 1;
    min-width: 0;
  }
  .thread-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .thread-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
</style>

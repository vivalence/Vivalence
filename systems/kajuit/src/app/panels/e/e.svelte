<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/kajuit";
  import { TERMINALS } from "$client";
  import { Section, Chip, Pip } from "@vivalence/drapes";
  import Labeled from "./widgets/Labeled.svelte";
  import Masked from "./widgets/Masked.svelte";
  import Aimed from "./widgets/Aimed.svelte";
  import Queueing from "./widgets/Queueing.svelte";

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const label = chain(terminals, "$active", "$thread", "$label");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");

  const TRAITS = [
    { name: "LABELED", label: "labeled", toggleable: false },
    { name: "MASKED", label: "masked", toggleable: false },
    { name: "AIMED", label: "aimed", toggleable: true },
    { name: "QUEUEING", label: "queueing", toggleable: true },
  ];

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

<div class="panel">
  {#if !$thread}
    <div class="active-card empty-card">
      <span class="active-label">active</span>
      <span class="empty">no thread</span>
    </div>
  {:else}
    <div class="active-card">
      <span class="active-label">active</span>
      <div class="crumb">
        <span class="daemon">{$thread.daemon?.slug ?? "—"}</span>
        <span class="seg">
          <span class="sep">/</span>
          <span class="modename">{$mode?.name ?? $mode?.slug ?? "—"}</span>
        </span>
        {#if $mode?.type}<span class="modetype">{$mode.type}</span>{/if}
        <!-- <span class="sep">/</span> -->
        <!-- <span class="thlabel">{labelText($label)}</span> -->
        <!-- <span class="spacer"></span> -->
      </div>
      <div class="traits">
        {#if ($mode?.traits ?? []).length}
          <span class="caps">{$mode.traits.join(" · ")}</span>
        {/if}
      </div>
    </div>

    <section class="traits">
      <Section label="traits" />
      <div class="chips">
        {#each TRAITS as trait (trait.name)}
          <Chip
            label={trait.label}
            active={active(trait.name)}
            mark={chipMark(trait)}
            disabled={!available(trait.name) && !active(trait.name)}
            onclick={() =>
              (available(trait.name) || active(trait.name)) && toggleWidget(trait.name)}
            onmark={() => toggleTrait(trait.name)} />
        {/each}
      </div>

      {#each [...open] as name (name)}
        {@const trait = TRAITS.find((entry) => entry.name === name)}
        {@const on = active(name)}
        <div class="widget" class:on>
          <div class="widget-head">
            <Pip size={6} tone={on ? "primary" : "muted"} />
            <span class="widget-name">{trait.label}</span>
            <span class="spacer"></span>
            <span class="widget-state" class:on>{on ? "active" : "available"}</span>
            {#if chipMark(trait)}
              <span
                class="widget-mark"
                class:remove={chipMark(trait) === "×"}
                onclick={() => toggleTrait(name)}>{chipMark(trait)}</span>
            {/if}
          </div>
          <div class="widget-body">
            {#if name === "LABELED"}
              <Labeled thread={$thread} />
            {:else if name === "MASKED"}
              <Masked thread={$thread} />
            {:else if name === "AIMED"}
              <Aimed thread={$thread} />
            {:else if name === "QUEUEING"}
              <Queueing thread={$thread} />
            {/if}
          </div>
        </div>
      {/each}
    </section>

    <div class="grow"></div>

    <section class="intent">
      <div class="intent-head">
        <span class="active-label">intent</span>
        <span class="spacer"></span>
      </div>
      {#if $thread.intent}
        <div class="intent-row">
          <span class="thlabel">{$thread.intent.name ?? $thread.intent.slug}</span>
          <span class="spacer"></span>
          <button class="act" disabled={savingIntent}>update intent</button>
        </div>
      {:else}
        <div class="intent-row">
          <span class="muted">unsaved thread config</span>
          <span class="spacer"></span>
          <button class="act" onclick={onSaveIntent} disabled={savingIntent}>
            {savingIntent ? "saving…" : "save as intent"}
          </button>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .panel {
    min-width: 300px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    letter-spacing: 0.02em;
    padding: 15px 17px 17px;
    box-sizing: border-box;
  }
  .grow {
    flex: 1;
    min-height: 12px;
  }
  .active-label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, currentColor 45%, transparent);
  }
  .spacer {
    flex: 1;
    min-width: 14px;
  }
  .empty,
  .muted {
    opacity: 0.35;
  }

  .active-card {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 45%, transparent);
    border-radius: 4px;
    padding: 11px 15px;
    margin-bottom: 16px;
  }
  .empty-card {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .crumb {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    margin-top: 7px;
    font-size: var(--font-size-md);
  }
  .crumb .daemon {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
  .crumb .modename {
    color: var(--colors-skeleton-0-primary-base);
  }
  .crumb .seg {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    white-space: nowrap;
  }
  .crumb .sep {
    opacity: 0.28;
  }
  .crumb .thlabel {
    color: color-mix(in srgb, currentColor 85%, transparent);
  }
  .modetype {
    padding: 1px 7px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 55%, transparent);
    border-radius: 2px;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  .caps {
    font-size: var(--font-size-sm);
    letter-spacing: 0.06em;
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 70%, transparent);
  }

  section :global(.section-head) {
    margin-bottom: 11px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 12px;
  }

  .widget {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 40%, transparent);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 9px;
  }
  .widget-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 13px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 30%, transparent);
  }
  .widget.on .widget-head {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 7%, transparent);
    border-bottom-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 18%, transparent);
  }
  .widget-name {
    font-size: var(--font-size-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, currentColor 55%, transparent);
  }
  .widget.on .widget-name {
    color: var(--colors-skeleton-0-primary-base);
  }
  .widget-state {
    font-size: var(--font-size-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.3;
  }
  .widget-state.on {
    color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 65%, transparent);
    opacity: 1;
  }
  .widget-mark {
    cursor: pointer;
    opacity: 0.7;
  }
  .widget-mark:hover {
    opacity: 1;
  }
  .widget-mark.remove {
    color: var(--colors-skeleton-0-danger-base);
  }
  .widget-body {
    padding: 11px 13px;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .intent {
    padding-top: 14px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 35%, transparent);
  }
  .intent-head {
    display: flex;
    align-items: center;
    margin-bottom: 9px;
  }
  .intent-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .intent-row .thlabel {
    color: var(--colors-skeleton-0-primary-base);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .act {
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.4;
    cursor: pointer;
  }
  .act:hover:not(:disabled) {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .act:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>

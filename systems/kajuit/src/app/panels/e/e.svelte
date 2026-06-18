<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/kajuit";
  import { TERMINALS } from "$client";
  import TraitTagRow from "@vivalence/kajuit/skins/trait/TraitTagRow.svelte";
  import TraitTag from "@vivalence/kajuit/skins/trait/TraitTag.svelte";
  import TraitTagIcon from "@vivalence/kajuit/skins/trait/TraitTagIcon.svelte";
  import Labeled from "@vivalence/kajuit/skins/trait/widgets/Labeled.svelte";
  import Masked from "@vivalence/kajuit/skins/trait/widgets/Masked.svelte";
  import Aimed from "@vivalence/kajuit/skins/trait/widgets/Aimed.svelte";
  import Queueing from "@vivalence/kajuit/skins/trait/widgets/Queueing.svelte";

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

  let open = $state(new Set(["LABELED"]));
  function toggleWidget(name) {
    open.has(name) ? open.delete(name) : open.add(name);
    open = new Set(open);
  }

  function active(name) {
    return $threadTraits?.includes(name) ?? false;
  }

  function available(name) {
    if (name === "AIMED") return ($mode?.emitter?.leaves?.length ?? 0) > 0;
    if (name === "QUEUEING") return $threadTraits?.includes("AIMED") ?? false;
    return true;
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
  <section class="info">
    <header>active</header>
    {#if !$thread}
      <div class="empty">no thread</div>
    {:else}
      <div class="kv"><span class="k">daemon</span><span class="v">{$thread.daemon?.slug ?? "—"}</span></div>
      <div class="kv">
        <span class="k">mode</span>
        <span class="v">{$mode?.name ?? $mode?.slug ?? "—"}</span>
        <span class="type">{$mode?.type ?? ""}</span>
      </div>
      <div class="kv"><span class="k">label</span><span class="v">{labelText($label)}</span></div>
      <div class="kv">
        <span class="k">traits</span>
        <span class="v">{($mode?.traits ?? []).join(" · ") || "—"}</span>
      </div>
    {/if}
  </section>

  <section class="traits">
    <header>traits</header>
    <TraitTagRow>
      {#each TRAITS as trait (trait.name)}
        <TraitTag
          name={trait.label}
          active={active(trait.name)}
          open={open.has(trait.name)}
          disabled={!available(trait.name)}
          onclick={() => available(trait.name) && toggleWidget(trait.name)}>
          {#if trait.toggleable && available(trait.name)}
            <TraitTagIcon active={active(trait.name)} onclick={() => toggleTrait(trait.name)} />
          {/if}
        </TraitTag>
      {/each}
    </TraitTagRow>
    {#if $thread}
      {#each [...open] as name (name)}
        {@const trait = TRAITS.find((entry) => entry.name === name)}
        <div class="widget">
          <div class="widget-head">
            <span class="widget-name" class:active={active(name)}>{trait.label}</span>
            {#if trait.toggleable}
              <TraitTagIcon active={active(name)} onclick={() => toggleTrait(name)} />
            {/if}
          </div>
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
      {/each}
    {/if}
  </section>

  <section class="intent">
    <header>intent</header>
    {#if !$thread}
      <div class="empty">no thread</div>
    {:else if $thread.intent}
      <div class="kv">
        <span class="k">current</span>
        <span class="v">{$thread.intent.name ?? $thread.intent.slug}</span>
      </div>
      <button class="act" disabled={savingIntent}>update intent</button>
    {:else}
      <div class="empty">unsaved thread config</div>
      <button class="act" onclick={onSaveIntent} disabled={savingIntent}>
        {savingIntent ? "saving…" : "save as intent"}
      </button>
    {/if}
  </section>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
  }
  section {
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 50%, transparent);
    padding: 6px 10px 8px;
  }
  .intent {
    margin-top: auto;
    border-bottom: none;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 50%, transparent);
    min-height: 72px;
  }
  header {
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.5;
    padding-bottom: 6px;
  }
  .empty {
    opacity: 0.3;
    padding: 3px 0;
  }
  .kv {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 1px 0;
  }
  .k {
    min-width: 56px;
    opacity: 0.5;
  }
  .v {
    color: var(--colors-skeleton-0-primary-base);
  }
  .type {
    opacity: 0.4;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
  }
  .widget {
    margin-top: 4px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 50%, transparent);
    border-radius: 3px;
  }
  .widget-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px 4px 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 40%, transparent);
  }
  .widget-name {
    flex: 1;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: color-mix(in srgb, currentColor 50%, transparent);
  }
  .widget-name.active {
    color: var(--colors-skeleton-0-primary-base);
  }
  .act {
    margin-top: 6px;
    padding: 3px 11px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
    opacity: 0.6;
  }
  .act:hover:not(:disabled) {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .act:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
</style>

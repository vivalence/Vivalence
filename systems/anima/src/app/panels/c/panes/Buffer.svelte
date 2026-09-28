<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Empty, Reading, Section, Status, Tag } from "@vivalence/drapes";
  import { TERMINALS } from "$client";

  const terminals = getContext(TERMINALS);

  const terminal = terminals.$active;
  const thread = chain(terminals, "$active", "$thread");
  const buffer = chain(terminals, "$active", "$buffer");
  const data = chain(terminals, "$active", "$buffer", "$data");
  const label = chain(terminals, "$active", "$buffer", "$label");
  const record = chain(terminals, "$active", "$buffer", "$view");
  const application = chain(terminals, "$active", "$buffer", "mode", "$application");

  const TONES = { PENDING: "idle", ACTIVE: "primary", DONE: "positive", ERROR: "negative", STALE: "caution" };
  const HOOKS = ["mount", "unmount", "release"];

  const view = $derived($record ?? $application?.view ?? null);
  const identity = $derived(view ? (view.hash ?? `${view.bundle?.url ?? $application?.url ?? ""}${view.mount?.nature ?? ""}`) : null);
  const entries = $derived(Object.entries($data ?? {}));

  const brief = (value) => String(value ?? "—").slice(-8);
  const written = (value) => (value !== null && typeof value === "object" ? JSON.stringify(value) : String(value));
</script>

{#if !$thread}
  <Empty verb="no thread" trace="the buffer pane follows the cursor" />
{:else if !$buffer}
  <Empty verb="cursor empty" trace="open a buffer or pick one in the thread pane" />
{:else}
  <div class="buffer">
    <div class="buffer-part">
      <Section label="frame">
        {#snippet action()}
          <Status tone={TONES[$buffer.status] ?? "none"} word={$buffer.status?.toLowerCase() ?? null} live={$buffer.status === "ACTIVE"} />
        {/snippet}
      </Section>
      <div class="buffer-readings">
        <Reading label="buffer">{$label?.name ?? `buffer ${$buffer.index ?? 0}`}</Reading>
        <Reading label="identity"><span title={identity ?? ""}>{identity ?? "the buffer has no view"}</span></Reading>
        <Reading label="remount">{brief($buffer.id)} · {brief(identity)} · {brief($terminal?.id)}</Reading>
      </div>
      <span class="buffer-note">lifecycle · the frame keeps its standing to itself, the pane has no source for it</span>
    </div>

    <div class="buffer-part">
      <Section label="hooks" count={HOOKS.length} />
      <div class="buffer-hooks">
        {#each HOOKS as name (name)}
          <Tag led lit={($buffer.hooks?.[name]?.length ?? 0) > 0} title="{$buffer.hooks?.[name]?.length ?? 0} held">{name}</Tag>
        {/each}
      </div>
    </div>

    <div class="buffer-part">
      <Section label="data" count="{entries.length} keys" />
      <div class="buffer-readings">
        {#each entries as [key, value] (key)}
          <Reading label={key}><span title={written(value)}>{written(value)}</span></Reading>
        {:else}
          <span class="buffer-note">a fresh buffer holds no data</span>
        {/each}
      </div>
    </div>

    <div class="buffer-part">
      <Section label="wires" />
      <span class="buffer-note">a client buffer holds no wire · the mode's wires are in the mode pane</span>
    </div>
  </div>
{/if}

<style>
  .buffer {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 6px 4px 4px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .buffer-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .buffer-readings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .buffer-hooks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .buffer-note {
    color: var(--text-light);
    line-height: var(--size-leading-loose);
  }
</style>

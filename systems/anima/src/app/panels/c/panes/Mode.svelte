<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Empty, Key, Reading, Row, Section, Status, Tag } from "@vivalence/drapes";
  import { logger } from "$telemetry";
  import { TERMINALS } from "$client";
  import ThreadLabel from "../../d/ThreadLabel.svelte";

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const application = chain(terminals, "$active", "$thread", "$mode", "$application");
  const standing = chain(terminals, "$active", "$thread", "$mode", "status", "$transient");
  const threads = chain(terminals, "$active", "$thread", "daemon", "entities", "thread", "$entities");

  const TONES = { HEALTHY: "positive", UNAVAILABLE: "caution", ERROR: "negative" };
  const WIRED = ["APPLICATION", "EMITTER", "EXPOSED", "HARNESSED"];

  const branches = (wire) => Object.keys(wire?.branches ?? {});
  const routes = (wire) => (wire?.effect ? 1 : 0) + Object.values(wire?.branches ?? {}).reduce((total, branch) => total + routes(branch), 0);

  const SAID = {
    APPLICATION: () => "serves a view · the frame mounts its bundle",
    EMITTER: (held) => `emits buffers · ${branches(held.metadata?.emitter).join(", ") || "no branch"}`,
    EXPOSED: (held) => `opens its aperture · ${routes(held.metadata?.aperture)} routes`,
    HARNESSED: (held) => `answers in the dock · ${branches(held.metadata?.harness).join(" · ") || "no faculty"}`,
    GENERATIVE: () => "draws a view per buffer · it beats the application's",
    STANDALONE: () => "opens a buffer without an aim",
    CONVERSATIONAL: () => "listed in navigation as a mode to talk to",
  };

  const traits = $derived.by(() => {
    void $standing;
    return ($mode?.traits ?? []).map((name) => ({ name, wired: WIRED.includes(name), said: SAID[name]?.($mode) ?? "declared · the client reads nothing of it" }));
  });
  const view = $derived($application?.view ?? null);
  const integrity = $derived(view?.bundle?.entry?.(view.mount?.nature)?.integrity ?? view?.hash ?? null);
  const siblings = $derived(($threads ?? []).filter((held) => (held.mode?.id ?? held.mode) === $mode?.id));
  const wires = $derived.by(() => {
    void $standing;
    const metadata = $mode?.metadata ?? {};
    return [
      ["aperture", metadata.aperture ? `/metadata/aperture · ${routes(metadata.aperture)} routes` : null],
      ["emitter", metadata.emitter ? `/metadata/emitter · ${branches(metadata.emitter).length} branches` : null],
      ["harness", metadata.harness ? `/metadata/harness · ${branches(metadata.harness).join(" · ")}` : null],
      ["view", view ? `${view.kind} · ${view.mount?.nature ?? "—"}` : null],
    ];
  });

  let minting = $state(false);

  async function mint() {
    const held = $mode;
    const daemon = $thread?.daemon;
    if (!held || !daemon || minting) return;
    minting = true;
    try {
      const terminal = terminals.active ?? terminals.create();
      const minted = await daemon.entities.thread.create({ mode: held.id });
      daemon.entities.thread.resolve?.(minted);
      terminal.thread = minted;
    } catch (error) {
      logger.entry(`threads/${daemon.slug}/${held.slug}`).fault(error);
    } finally {
      minting = false;
    }
  }

  function load(held) {
    const terminal = terminals.active ?? terminals.create();
    terminal.thread = held;
  }
</script>

{#if !$thread || !$mode}
  <Empty verb="no thread" trace="the mode pane follows the active thread" />
{:else}
  <div class="mode">
    <div class="mode-face">
      <span class="mode-mark">{($mode.slug ?? "").slice(0, 2)}</span>
      <span class="mode-names">
        <span class="mode-line">
          <span class="mode-name">{$mode.name ?? $mode.slug}</span>
          {#if $mode.type}<Tag>{$mode.type}</Tag>{/if}
        </span>
        <span class="mode-mount">{$thread.daemon?.slug ?? "—"} · /mode/{$mode.type}/{$mode.slug}</span>
      </span>
      <Status tone={TONES[$standing?.code] ?? "idle"} word={($standing?.code ?? "unknown").toLowerCase()} live={$standing?.code === "HEALTHY"} />
    </div>

    <div class="mode-part">
      <Section label="traits" count={traits.length} />
      <div class="mode-traits">
        {#each traits as trait (trait.name)}
          <div class="mode-trait">
            <Tag tone={trait.wired ? "primary" : "plain"}>{trait.name.toLowerCase()}</Tag>
            <span class="mode-said">{trait.said}</span>
          </div>
        {:else}
          <span class="mode-note">the mode declares no trait</span>
        {/each}
      </div>
    </div>

    <div class="mode-part">
      <Section label="wires" />
      <div class="mode-readings">
        {#each wires as [name, value] (name)}
          <Reading label={name}>{value ?? "—"}</Reading>
        {/each}
        <Reading label="bundle">
          {#if $application?.url}<span title={$application.url}>{$application.url}</span>{:else}<span class="mode-note">no source on the client</span>{/if}
        </Reading>
        <Reading label="integrity">
          {#if integrity}<span title={integrity}>sha256 · {integrity.slice(0, 12)}</span>{:else}<span class="mode-note">no source on the client</span>{/if}
        </Reading>
      </div>
    </div>

    <div class="mode-part">
      <Section label="on this mode" count={siblings.length} />
      <div class="mode-threads">
        {#each siblings as held (held.id)}
          <Row selected={held.id === $thread.id} title="load into the active terminal" onclick={() => load(held)}>
            <span class="mode-thread"><ThreadLabel thread={held} /></span>
            <span class="mode-meta">{held.$buffers?.get()?.length ?? 0} buffers</span>
          </Row>
        {/each}
      </div>
      <div class="mode-verbs">
        <Key size="row" label={minting ? "…" : "new thread"} title="a new thread on this mode" onclick={mint} />
      </div>
    </div>
  </div>
{/if}

<style>
  .mode {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 6px 4px 4px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .mode-face {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .mode-mark {
    flex: none;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: var(--shape-radius-card);
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-sm);
    font-weight: 600;
    text-transform: var(--shape-label-case);
    color: var(--signal-primary-ink);
  }
  .mode-names {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .mode-line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .mode-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-sm);
    font-weight: 600;
    color: var(--text-strong);
  }
  .mode-mount {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
  .mode-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .mode-traits,
  .mode-readings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .mode-trait {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }
  .mode-said {
    min-width: 0;
    color: var(--text-ink);
    line-height: var(--size-leading-loose);
    overflow-wrap: anywhere;
  }
  .mode-note {
    color: var(--text-light);
  }
  .mode-threads {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .mode-thread {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mode-meta {
    flex: none;
    color: var(--text-muted);
  }
  .mode-verbs {
    display: flex;
    gap: 8px;
    padding-bottom: var(--size-depth);
  }
</style>

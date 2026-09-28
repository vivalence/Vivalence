<script>
  import { Card, Input, Key, Pip, Pressed, Section, Spinner } from "@vivalence/drapes";

  let { lighthouse, onConnected, onRetry } = $props();

  const status = lighthouse.$status;
  const authorized = lighthouse.$isAuthorized;
  const remote = lighthouse.connection.url.href;
  const host = URL.canParse(remote) ? new URL(remote).host : remote;

  let username = $state("");
  let password = $state("");

  const busy = $derived($status.code === "AUTHENTICATING");
  const failed = $derived(["ERROR", "OFFLINE", "SESSION_EXPIRED"].includes($status.code));
  const standing = $derived($status.code.replaceAll("_", " ").toLowerCase());
  const tone = $derived(failed ? "danger" : busy ? "primary" : $status.code === "VERIFIED" ? "success" : "muted");

  const prompt = $derived(
    `anima signin at ${remote} shows "${standing}` +
      `${$status.message ? `: ${$status.message}` : ""}". ` +
      "diagnose it: run `viva instance/doctor`, check PUBLIC_VIVA_LIGHTHOUSE_REMOTE " +
      "in the instance .env, docs at https://docs.vivalence.org. " +
      "look in the repository in .ikiro for orientation and solutions.",
  );

  async function submit(event) {
    event.preventDefault();
    const result = await lighthouse.login(username, password);
    if (result.status === "OK") onConnected(lighthouse);
  }
</script>

<div class="signin">
  <div class="brand">
    <span class="brand-name">vivalence/anima</span>
  </div>

  <Card>
    <Section label="lighthouses" count={1} />
    <div class="row">
      <span class="row-name">{lighthouse.identity?.slug ?? host}</span>
      <span class="row-address">{remote}</span>
      <span class="row-state">
        {#if busy}<Spinner />{:else}<Pip size={7} {tone} pulse={busy} />{/if}
        {standing}
      </span>
    </div>
    {#if $status.message}<span class="detail">{$status.message}</span>{/if}
    <Pressed>
      <form class="credentials" onsubmit={submit}>
        <Input bind:value={username} placeholder="username" autocomplete="username" />
        <Input bind:value={password} type="password" placeholder="password" autocomplete="current-password" />
        <div class="verbs">
          {#if $authorized && failed}<Key size="field" label="retry" onclick={onRetry} />{/if}
          <Key size="field" tone="primary" type="submit" label="connect" disabled={busy} />
        </div>
      </form>
    </Pressed>
  </Card>

  <Card sunk>
    <Section label="help" />
    <p>there is no signup ui — accounts are created from the shell:</p>
    <code>viva instance/lighthouse signup &lt;username&gt; &lt;password&gt;</code>
    <p>docs: <a href="https://docs.vivalence.org" target="_blank">docs.vivalence.org</a></p>
    <p>stuck? paste this to your llm:</p>
    <code class="prompt">{prompt}</code>
  </Card>
</div>

<style>
  .signin {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
    max-width: 420px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-name {
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-xl);
    letter-spacing: -0.01em;
    color: var(--text-header);
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 2px 12px;
    padding: 10px 12px;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), 0 var(--size-depth) 0 var(--boundary);
    margin-bottom: var(--size-depth);
  }
  .row-name {
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-sm);
    font-weight: 600;
  }
  .row-address {
    grid-column: 1;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--control-on-muted);
  }
  .row-state {
    grid-column: 2;
    grid-row: 1 / 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .detail {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--signal-negative-ink);
  }
  .credentials {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .verbs {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-bottom: var(--size-depth);
  }
  p {
    margin: 0;
    font-size: var(--size-type-xs);
    color: var(--text-ink);
  }
  a {
    color: var(--text-link);
  }
  code {
    display: block;
    padding: 6px 10px;
    border-radius: var(--shape-radius-key);
    background: var(--surface-lift);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-code);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .prompt {
    user-select: all;
  }
</style>

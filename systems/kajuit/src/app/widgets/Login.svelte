<script>
  let { lighthouse, onConnected, onRetry } = $props();

  const status = lighthouse.$status;
  const authorized = lighthouse.$isAuthorized;
  const remote = lighthouse.connection.url.href;

  let username = $state("");
  let password = $state("");

  const busy = $derived($status.code === "AUTHENTICATING");
  const failed = $derived(["ERROR", "OFFLINE", "SESSION_EXPIRED"].includes($status.code));
  const standing = $derived(
    $status.code === "IDLE" ? null : $status.code.replaceAll("_", " ").toLowerCase(),
  );

  const prompt = $derived(
    `kajuit signin at ${remote} shows "${standing ?? "idle"}` +
      `${$status.message ? `: ${$status.message}` : ""}". ` +
      "diagnose it: run `viva instance/doctor`, check PUBLIC_VIVA_LIGHTHOUSE_REMOTE " +
      "in the instance .env, docs at https://docs.vivalence.org",
  );

  async function submit(event) {
    event.preventDefault();
    const result = await lighthouse.login(username, password);
    if (result.status === "OK") onConnected(lighthouse);
  }
</script>

<div class="signin">
  {#if standing}
    <div class="standing" class:failed>
      <span class="code">{standing}</span>
      {#if $status.message}<span class="detail">{$status.message}</span>{/if}
      {#if $authorized && failed}
        <button class="again" onclick={onRetry}>retry</button>
      {/if}
    </div>
  {/if}

  <form class="credentials" onsubmit={submit}>
    <input
      bind:value={username}
      placeholder="username"
      autocapitalize="off"
      autocorrect="off"
      autocomplete="username"
    />
    <input
      bind:value={password}
      type="password"
      placeholder="password"
      autocapitalize="off"
      autocomplete="current-password"
    />
    <button disabled={busy}>connect</button>
  </form>

  <div class="help">
    <p>there is no signup ui — accounts are created from the shell:</p>
    <code>viva instance/auth signup &lt;username&gt; &lt;password&gt;</code>
    <p>docs: <a href="https://docs.vivalence.org" target="_blank">docs.vivalence.org</a></p>
    <p>stuck? paste this to your llm:</p>
    <code class="prompt">{prompt}</code>
  </div>
</div>

<style>
  .signin {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 44ch;
    padding: 0 16px;
  }
  .standing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .standing .code {
    font-size: var(--font-size-xs);
    font-weight: 600;
  }
  .standing.failed .code {
    color: var(--colors-skeleton-0-danger-base);
  }
  .standing .detail {
    color: var(--colors-skeleton-2-contrast);
  }
  .again {
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-0-contrast);
    font: inherit;
    letter-spacing: inherit;
    padding: 4px 12px;
    cursor: pointer;
    margin-top: 6px;
  }
  .again:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .credentials {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    width: 24ch;
  }
  .credentials input {
    background: none;
    border: none;
    border-bottom: 1px solid var(--colors-skeleton-2-contrast);
    outline: none;
    font: inherit;
    letter-spacing: inherit;
    color: inherit;
    padding: 0.25em 0;
  }
  .credentials button {
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    padding: 4px 12px;
    cursor: pointer;
  }
  .credentials button:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .credentials button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .help {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: none;
    letter-spacing: normal;
  }
  .help p {
    margin: 0;
  }
  .help a {
    color: inherit;
  }
  .help code {
    display: block;
    padding: 6px 10px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .help .prompt {
    user-select: all;
  }
</style>

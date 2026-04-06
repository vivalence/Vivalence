<script>
  let { lighthouse, onConnected } = $props();

  let username = $state("");
  let password = $state("");
  let status = $state("idle");
  let error = $state(null);

  async function submit(event) {
    event.preventDefault();
    status = "busy";
    error = null;

    const result = await lighthouse.login(username, password);

    if (result.status === "OK") {
      status = "connected";
      onConnected(lighthouse);
    } else {
      status = "error";
      error = result.error?.message ?? "login failed";
    }
  }
</script>

<form class="login" onsubmit={submit}>
  <input bind:value={username} placeholder="username" disabled={status === "busy" || status === "connected"} />
  <input bind:value={password} type="password" placeholder="password" disabled={status === "busy" || status === "connected"} />
  <button disabled={status === "busy" || status === "connected"}>connect</button>
  {#if status === "error"}<span class="login-error">{error}</span>{/if}
  {#if status === "connected"}<span class="login-ok">connected as {username}</span>{/if}
</form>

<style>
  .login {
    display: flex;
    gap: 1ch;
    align-items: center;
  }
  .login input {
    background: none;
    border: none;
    border-bottom: 1px solid var(--colors-skeleton-2-contrast);
    outline: none;
    font: inherit;
    color: inherit;
    padding: 0.25em 0;
  }
  .login button {
    background: none;
    border: 1px solid var(--colors-skeleton-2-contrast);
    color: inherit;
    font: inherit;
    padding: 0.25em 1ch;
    cursor: pointer;
  }
  .login button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .login-error {
    color: var(--colors-theme-error-contrast, red);
  }
  .login-ok {
    color: var(--colors-theme-success-contrast, green);
  }
</style>

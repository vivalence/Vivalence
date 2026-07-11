<script>
  let {
    user,
    assistant,
    variant = "flat",
    placeholder = "ask the oracle",
    disabled = false,
    onsubmit,
  } = $props();

  let engaged = $state(false);
  let field = $state(null);

  const showUser = $derived(engaged || !!$user?.length);

  $effect(() => {
    if (showUser && field) field.focus();
  });

  function submit() {
    const text = $user?.trim();
    if (!text || disabled) return;
    onsubmit?.(text);
    user.set("");
    engaged = false;
  }
</script>

<div class="helpdesk" data-variant={variant}>
  {#if showUser}
    <textarea
      bind:this={field}
      class="slot user"
      rows="1"
      {placeholder}
      {disabled}
      value={$user}
      oninput={(event) => user.set(event.target.value)}
      onblur={() => (engaged = false)}
      onkeydown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submit();
        }
        if (event.key === "Escape") {
          user.set("");
          engaged = false;
        }
      }}></textarea>
  {:else}
    <button class="slot assistant" onclick={() => (engaged = true)}>{$assistant}</button>
  {/if}
</div>

<style>
  .helpdesk {
    display: flex;
    font-family: var(--font-family-code);
    color: var(--colors-skeleton-3-contrast);
  }
  .slot {
    flex: 1;
    min-height: 2.6em;
    padding: 12px 16px;
    font: inherit;
    font-size: var(--font-size-sm);
    line-height: 1.5;
    color: inherit;
    text-align: left;
    border: 1px solid transparent;
    border-radius: 12px 12px 12px 3px;
  }
  .assistant {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 15%, transparent);
    cursor: text;
  }
  .assistant:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 20%, transparent);
  }
  .user {
    resize: none;
    background: transparent;
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
    border-radius: 3px 12px 12px 12px;
  }
  .user::placeholder {
    color: color-mix(in srgb, currentColor 35%, transparent);
  }
  .user:disabled {
    opacity: 0.5;
  }
</style>

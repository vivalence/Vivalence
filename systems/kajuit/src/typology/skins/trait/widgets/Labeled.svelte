<script>
  import { fn } from "@vivalence/typology";

  let { thread } = $props();

  let value = $state("");
  let pending = $state(false);
  let bound = null;

  $effect(() => {
    if (thread?.id === bound) return;
    bound = thread?.id;
    const label = thread?.label;
    value = (typeof label === "object" ? label?.name : label) ?? "";
  });

  const persist = fn.debounce((next) => {
    if (!thread) {
      pending = false;
      return;
    }
    thread.daemon.entities.thread
      .updateOne(
        { id: thread.id },
        { trait: { ...thread.trait, LABELED: { ...(thread.trait?.LABELED ?? {}), name: next } } },
      )
      .finally(() => (pending = false));
  }, 5000);

  function onInput(next) {
    value = next;
    if (!thread) return;
    const label = typeof thread.label === "object" && thread.label ? thread.label : {};
    thread.label = { ...label, name: next };
    pending = true;
    persist(next);
  }
</script>

<div class="labeled-widget">
  <label class="field">
    <span class="key">label</span>
    <input
      class="text"
      {value}
      oninput={(event) => onInput(event.currentTarget.value)}
      placeholder="—" />
    <span class="dot" class:pending title={pending ? "pending sync" : "synced"}></span>
  </label>
</div>

<style>
  .labeled-widget {
    padding: 6px 8px;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .key {
    min-width: 44px;
    opacity: 0.5;
    font-size: var(--font-size-2xs);
  }
  .text {
    flex: 1;
    background: transparent;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    padding: 2px 5px;
  }
  .text:focus {
    outline: none;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .dot {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 70%, transparent);
    transition: background 0.2s;
  }
  .dot.pending {
    background: var(--colors-skeleton-0-warning-base);
  }
</style>

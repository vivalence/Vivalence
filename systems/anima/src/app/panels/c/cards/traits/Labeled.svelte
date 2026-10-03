<script>
  import { fn } from "@vivalence/typology";
  import { Input, Status } from "@vivalence/drapes";

  let { thread } = $props();

  let value = $state("");
  let description = $state("");
  let pending = $state(false);
  let bound = null;
  let unsaved = {};

  $effect(() => {
    if (thread?.id === bound) return;
    bound = thread?.id;
    const label = thread?.label;
    value = (typeof label === "object" ? label?.name : label) ?? "";
    description = (typeof label === "object" ? label?.description : null) ?? "";
  });

  const persist = fn.debounce((next) => {
    unsaved = {};
    if (!thread) {
      pending = false;
      return;
    }
    thread.daemon.entities.thread
      .updateOne(
        { id: thread.id },
        { trait: { ...thread.trait, LABELED: { ...(thread.trait?.LABELED ?? {}), ...next } } },
      )
      .finally(() => (pending = false));
  }, 5000);

  function onInput(next) {
    if (!thread) return;
    const label = typeof thread.label === "object" && thread.label ? thread.label : {};
    thread.label = { ...label, ...next };
    unsaved = { ...unsaved, ...next };
    pending = true;
    persist(unsaved);
  }
</script>

<div class="labeled">
  <label class="labeled-field">
    <span class="labeled-name">name</span>
    <Input bind:value placeholder="—" oninput={(event) => onInput({ name: event.currentTarget.value })} />
    <Status tone={pending ? "caution" : "none"} title={pending ? "pending sync" : "synced"} />
  </label>
  <label class="labeled-field">
    <span class="labeled-name">description</span>
    <Input bind:value={description} placeholder="what this thread is for" oninput={(event) => onInput({ description: event.currentTarget.value || null })} />
  </label>
  <span class="labeled-note">writes debounce 5s · the dot turns caution while pending</span>
</div>

<style>
  .labeled {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .labeled-field {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .labeled-name {
    flex: 0 0 76px;
    color: var(--text-light);
  }
  .labeled-note {
    color: var(--text-light);
    line-height: var(--size-leading-loose);
  }
</style>

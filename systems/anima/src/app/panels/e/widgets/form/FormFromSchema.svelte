<script>
  import { fields } from "./schema.js";
  import EntityField from "./EntityField.svelte";
  import EntitySetField from "./EntitySetField.svelte";

  let { schema, value = {}, onchange, daemon } = $props();

  let entries = $derived(fields(schema));

  function set(name, next) {
    onchange?.({ ...value, [name]: next });
  }
</script>

<div class="form">
  {#each entries as field (field.name)}
    {#if field.kind === "entity-ref" || field.kind === "entity-set"}
      <div class="field block">
        <span class="key">
          {field.name}{#if field.required}<span class="req">*</span>{/if}
        </span>
        {#if field.kind === "entity-ref"}
          <EntityField
            {daemon}
            entity={field.entity}
            value={value[field.name]}
            description={field.description}
            onchange={(next) => set(field.name, next)} />
        {:else}
          <EntitySetField
            {daemon}
            entity={field.entity}
            value={value[field.name] ?? []}
            onchange={(next) => set(field.name, next)} />
        {/if}
      </div>
    {:else}
      <label class="field">
        <span class="key">
          {field.name}{#if field.required}<span class="req">*</span>{/if}
        </span>
        {#if field.kind === "enum"}
          <select
            class="control"
            value={value[field.name] ?? ""}
            onchange={(event) => set(field.name, event.currentTarget.value || undefined)}>
            <option value="">—</option>
            {#each field.options as option}<option value={option}>{option}</option>{/each}
          </select>
        {:else if field.kind === "number"}
          <input
            class="control"
            type="number"
            value={value[field.name] ?? field.fallback ?? ""}
            oninput={(event) =>
              set(field.name, event.currentTarget.value === "" ? undefined : Number(event.currentTarget.value))} />
        {:else if field.kind === "boolean"}
          <input
            class="control checkbox"
            type="checkbox"
            checked={!!value[field.name]}
            onchange={(event) => set(field.name, event.currentTarget.checked)} />
        {:else}
          <input
            class="control"
            type="text"
            value={value[field.name] ?? ""}
            placeholder={field.description}
            oninput={(event) => set(field.name, event.currentTarget.value || undefined)} />
        {/if}
      </label>
    {/if}
  {:else}
    <span class="muted">no fields</span>
  {/each}
</div>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 8px;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .field.block {
    flex-direction: column;
    align-items: stretch;
    gap: 3px;
  }
  .key {
    min-width: 64px;
    opacity: 0.55;
    font-size: var(--font-size-2xs);
  }
  .req {
    color: var(--colors-skeleton-0-warning-base);
    margin-left: 1px;
  }
  .control {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    padding: 2px 5px;
  }
  .control:focus {
    outline: none;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .checkbox {
    flex: 0 0 auto;
    width: 13px;
    height: 13px;
  }
  .muted {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
  }
</style>

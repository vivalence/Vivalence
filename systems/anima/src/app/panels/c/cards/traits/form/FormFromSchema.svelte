<script>
  import { Input } from "@vivalence/drapes";
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
      <div class="form-field stacked">
        <span class="form-name">
          {field.name}{#if field.required}<span class="form-required">*</span>{/if}
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
      <label class="form-field">
        <span class="form-name">
          {field.name}{#if field.required}<span class="form-required">*</span>{/if}
        </span>
        {#if field.kind === "enum"}
          <select
            class="form-choice"
            value={value[field.name] ?? ""}
            onchange={(event) => set(field.name, event.currentTarget.value || undefined)}>
            <option value="">—</option>
            {#each field.options as option}<option value={option}>{option}</option>{/each}
          </select>
        {:else if field.kind === "number"}
          <Input
            type="number"
            value={value[field.name] ?? field.fallback ?? ""}
            oninput={(event) =>
              set(field.name, event.currentTarget.value === "" ? undefined : Number(event.currentTarget.value))} />
        {:else if field.kind === "boolean"}
          <input
            class="form-check"
            type="checkbox"
            checked={!!value[field.name]}
            onchange={(event) => set(field.name, event.currentTarget.checked)} />
        {:else}
          <Input
            value={value[field.name] ?? ""}
            placeholder={field.description}
            oninput={(event) => set(field.name, event.currentTarget.value || undefined)} />
        {/if}
      </label>
    {/if}
  {:else}
    <span class="form-note">no fields</span>
  {/each}
</div>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .form-field {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .form-field.stacked {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
  .form-name {
    flex: 0 0 76px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-light);
  }
  .form-field.stacked .form-name {
    flex: none;
  }
  .form-required {
    margin-left: 1px;
    color: var(--signal-caution-ink);
  }
  .form-choice {
    flex: 1;
    min-width: 0;
    height: var(--size-field);
    padding: 0 10px;
    border: none;
    border-radius: var(--shape-radius-field);
    background: var(--control-field);
    color: var(--text-strong);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    outline: none;
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--size-type-xs);
  }
  .form-choice:focus {
    box-shadow: inset 0 0 0 calc(var(--size-ring) * 1.5) var(--control-focus);
  }
  .form-check {
    flex: none;
    width: 14px;
    height: 14px;
    accent-color: var(--signal-primary);
  }
  .form-note {
    color: var(--text-light);
  }
</style>

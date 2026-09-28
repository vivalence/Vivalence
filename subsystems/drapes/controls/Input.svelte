<script>
  let { value = $bindable(""), type = "text", placeholder = "", name = "", autocomplete = "", autocapitalize = "off", autocorrect = "off", spellcheck = false, title = null, oninput, onkeydown } = $props();
</script>

<input class="field" bind:value {type} {placeholder} {name} {autocomplete} {autocapitalize} {autocorrect} {spellcheck} {title} {oninput} {onkeydown} />

<style>
  .field {
    height: var(--size-field);
    min-width: 0;
    width: 100%;
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
    caret-color: var(--control-field-caret);
  }
  .field::placeholder {
    color: var(--control-field-placeholder);
    opacity: 1;
  }
  .field:focus {
    box-shadow: inset 0 0 0 calc(var(--size-ring) * 1.5) var(--control-focus);
  }
</style>

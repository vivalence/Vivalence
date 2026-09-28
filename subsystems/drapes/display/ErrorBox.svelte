<!--
  ErrorBox — display an error message as a styled box.
  The negative signal washed to a background, its ink on it, its fill as the line.
-->
<script>
  let {
    title = "",
    class: className = "",
    children,
  } = $props();

  const boxClasses = "bg-signal-negative-tint text-signal-negative-ink border-signal-negative";
</script>

<div class="rounded border p-3 {boxClasses} {className}" role="alert">
  {#if title}
    <div class="font-medium mb-1">{title}</div>
  {/if}
  {#if children}{@render children()}{/if}
</div>

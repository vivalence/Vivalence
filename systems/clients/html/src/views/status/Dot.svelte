<script>
  let {
    status,
    variant = "simple",
    size = "sm",
    class: className = "",
  } = $props();

  const statusMap = {
    IDLE: { color: "system-disabled", icon: "○" },
    PENDING: { color: "system-info", icon: "◐" },
    ALIVE: { color: "system-success", icon: "●" },
    SUCCESS: { color: "system-success", icon: "●" },
    ERROR: { color: "system-error", icon: "●" },
    STOP: { color: "system-warning", icon: "●" },
  };

  const sizes = {
    tiny: "w-2 h-2 text-xs",
    xs: "w-3 h-3 text-sm",
    sm: "w-4 h-4 text-base",
    md: "w-6 h-6 text-lg",
    lg: "w-8 h-8 text-xl",
  };

  let config = $derived(statusMap[$status?.code] || statusMap.IDLE);
  let sizeClasses = $derived(sizes[size] || sizes.sm);
  let colorClasses = $derived(
    `text-${config.color}-contrast bg-${config.color}-surface border-${config.color}-boundary`,
  );

  let title = $derived(() => {
    let parts = [$status?.code || "UNKNOWN"];
    if ($status?.label) parts.push($status.label);
    if ($status?.timestamp)
      parts.push(new Date($status.timestamp).toLocaleTimeString());
    return parts.join(" • ");
  });

</script>

<div
  class="inline-flex items-center justify-center rounded-full border {sizeClasses} {colorClasses} {className}">
  {#if variant === "rich" && $status?.error}
    <span class="text-current">{title}</span>
  {:else if variant === "icon"}
    <span class="text-current">{config.icon}</span>
  {:else}
    <!-- Simple dot - just the colored circle -->
  {/if}
</div>

{#if variant === "rich" && $status?.error}
  <div class="sr-only">
    Error: {$status.error.message}
  </div>
{/if}

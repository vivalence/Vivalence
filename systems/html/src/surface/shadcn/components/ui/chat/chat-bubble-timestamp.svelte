<script>
  import { cn } from "@client/shadcn/utils.js";

  let { timestamp, class: className, ...restProps } = $props();
</script>

<div class={cn("text-xs mt-2 text-right", className)} {...restProps}>
  {timestamp}
</div>

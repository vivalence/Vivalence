<script>
  import { cn } from "@client/shadcn/utils.js";

  let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div 
  bind:this={ref}
  class={cn("flex-grow overflow-y-auto", className)}
  {...restProps}
>
  {@render children?.()}
</div>

<script>
  import { cn } from "@client/shadcn/utils.js";
  import { chatBubbleVariant } from "./chat-bubble-variants.js";

  let { 
    ref = $bindable(null),
    class: className, 
    variant = "received",
    layout = "default",
    children,
    ...restProps 
  } = $props();
</script>

<div
  bind:this={ref}
  class={cn(chatBubbleVariant({ variant, layout }), className, "relative group")}
  {...restProps}
>
  {@render children?.()}
</div>

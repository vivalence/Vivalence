<script>
  import { cn } from "@client/shadcn/utils.js";
  import { chatBubbleMessageVariants } from "./chat-bubble-variants.js";
  import MessageLoading from "./message-loading.svelte";

  let { 
    ref = $bindable(null),
    class: className, 
    variant = "received",
    layout = "default",
    isLoading = false,
    children,
    ...restProps 
  } = $props();
</script>

<div
  bind:this={ref}
  class={cn(
    chatBubbleMessageVariants({ variant, layout }),
    "break-words max-w-full whitespace-pre-wrap",
    className
  )}
  {...restProps}
>
  {#if isLoading}
    <div class="flex items-center space-x-2">
      <MessageLoading />
    </div>
  {:else}
    {@render children?.()}
  {/if}
</div>

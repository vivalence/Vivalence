<script>
  import { onMount, onDestroy } from 'svelte';
  import { Button } from "@client/shadcn/components/ui/button/index.js";
  import { Icon } from "@vivalence/interface";
  import { cn } from "@client/shadcn/utils.js";
  import { useAutoScroll } from "./hooks/use-auto-scroll.js";
  
  let { class: className, smooth = false, children, ...restProps } = $props();
  
  let scrollRef;
  let isAtBottom = true;
  let autoScrollEnabled = true;
  let autoScroll = null;
  let cleanup = null;
  
  function scrollToBottom() {
    if (autoScroll) {
      autoScroll.scrollToBottom();
    }
  }
  
  function disableAutoScroll() {
    if (autoScroll) {
      autoScroll.disableAutoScroll();
    }
  }
  
  onMount(() => {
    if (scrollRef) {
      const scrollHandler = useAutoScroll(scrollRef, { smooth });
      autoScroll = scrollHandler;
      cleanup = scrollHandler.cleanup;
      
      // Manual subscription setup
      const unsubscribe = scrollHandler.getState.subscribe((state) => {
        isAtBottom = state.isAtBottom;
        autoScrollEnabled = state.autoScrollEnabled;
      });
      
      return () => {
        unsubscribe();
        if (cleanup) cleanup();
      };
    }
  });
  
  onDestroy(() => {
    if (cleanup) cleanup();
  });
</script>

<div class="relative w-full h-full">
  <div
    class={cn("flex flex-col w-full h-full p-4 overflow-y-auto", className)}
    bind:this={scrollRef}
    on:wheel={disableAutoScroll}
    on:touchmove={disableAutoScroll}
    {...restProps}
  >
    <div class="flex flex-col gap-6">
      {@render children?.()}
    </div>
  </div>
  
  {#if !isAtBottom}
    <Button
      on:click={scrollToBottom}
      size="icon"
      variant="outline"
      class="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
      aria-label="Scroll to bottom"
    >
      <Icon carbon="ArrowDown" size="sm" />
    </Button>
  {/if}
</div>

<!-- <script> -->
<!--   import { onMount } from 'svelte'; -->
<!--   import { Button } from "@client/shadcn/components/ui/button/index.js"; -->
<!--   import { Icon } from "@vivalence/interface"; -->
<!--   import { cn } from "@client/shadcn/utils.js"; -->
<!--   import { useAutoScroll } from "./hooks/use-auto-scroll.js"; -->

<!--   let { class: className, smooth = false, children, ...restProps } = $props(); -->
  
<!--   let scrollRef; -->
<!--   let isAtBottom = true; -->
<!--   let autoScrollEnabled = true; -->
<!--   let autoScroll; -->

<!--   function scrollToBottom() { -->
<!--     if (autoScroll) { -->
<!--       autoScroll.scrollToBottom(); -->
<!--     } -->
<!--   } -->

<!--   function disableAutoScroll() { -->
<!--     if (autoScroll) { -->
<!--       autoScroll.disableAutoScroll(); -->
<!--     } -->
<!--   } -->

<!--   onMount(() => { -->
<!--     if (scrollRef) { -->
<!--       autoScroll = useAutoScroll(scrollRef, { smooth }); -->
      
<!--       const unsubscribe = autoScroll.getState.subscribe(state => { -->
<!--         isAtBottom = state.isAtBottom; -->
<!--         autoScrollEnabled = state.autoScrollEnabled; -->
<!--       }); -->

<!--       return unsubscribe; -->
<!--     } -->
<!--   }); -->
<!-- </script> -->

<!-- <div class="relative w-full h-full"> -->
<!--   <div -->
<!--     class={cn("flex flex-col w-full h-full p-4 overflow-y-auto", className)} -->
<!--     bind:this={scrollRef} -->
<!--     on:wheel={disableAutoScroll} -->
<!--     on:touchmove={disableAutoScroll} -->
<!--     {...restProps} -->
<!--   > -->
<!--     <div class="flex flex-col gap-6"> -->
<!--       {@render children?.()} -->
<!--     </div> -->
<!--   </div> -->

<!--   {#if !isAtBottom} -->
<!--     <Button -->
<!--       on:click={scrollToBottom} -->
<!--       size="icon" -->
<!--       variant="outline" -->
<!--       class="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md" -->
<!--       aria-label="Scroll to bottom" -->
<!--     > -->
<!--       <Icon carbon="ArrowDown" size="sm" /> -->
<!--     </Button> -->
<!--   {/if} -->
<!-- </div> -->

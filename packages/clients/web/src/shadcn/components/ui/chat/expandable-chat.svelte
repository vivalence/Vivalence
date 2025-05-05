<script>
  import { onMount } from "svelte";
  import { cn } from "@client/shadcn/utils.js";
  import { Button } from "@client/shadcn/components/ui/button/index.js";
  import { Icon } from "@vivalence/interface";

  // Props
  let {
    ref = $bindable(null),
    class: className,
    position = "bottom-right",
    size = "md",
    icon,
    children,
    ...restProps
  } = $props();

  // State
  let isOpen = $state(false);
  let chatRef;

  // Configuration
  const chatConfig = {
    dimensions: {
      sm: "sm:max-w-sm sm:max-h-[500px]",
      md: "sm:max-w-md sm:max-h-[600px]",
      lg: "sm:max-w-lg sm:max-h-[700px]",
      xl: "sm:max-w-xl sm:max-h-[800px]",
      full: "sm:w-full sm:h-full",
    },
    positions: {
      "bottom-right": "bottom-5 right-5",
      "bottom-left": "bottom-5 left-5",
    },
    chatPositions: {
      "bottom-right": "sm:bottom-[calc(100%+10px)] sm:right-0",
      "bottom-left": "sm:bottom-[calc(100%+10px)] sm:left-0",
    },
    states: {
      open: "pointer-events-auto opacity-100 visible scale-100 translate-y-0",
      closed: "pointer-events-none opacity-0 invisible scale-100 sm:translate-y-5",
    },
  };

  function toggleChat() {
    isOpen = !isOpen;
  }
</script>

<div
  class={cn(`fixed ${chatConfig.positions[position]} z-50`, className)}
  bind:this={ref}
  {...restProps}>
  <div
    bind:this={chatRef}
    class={cn(
      "flex flex-col bg-background border sm:rounded-lg shadow-md overflow-hidden transition-all duration-250 ease-out sm:absolute sm:w-[90vw] sm:h-[80vh] fixed inset-0 w-full h-full sm:inset-auto",
      chatConfig.chatPositions[position],
      chatConfig.dimensions[size],
      isOpen ? chatConfig.states.open : chatConfig.states.closed,
    )}>
    {@render children?.()}
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-2 right-2 sm:hidden"
      on:click={toggleChat}>
      <Icon carbon="X" size="sm" />
    </Button>
  </div>

  <!-- Chat Toggle Button -->
  <Button
    variant="default"
    on:click={toggleChat}
    class={cn(
      "w-14 h-14 rounded-full shadow-md flex items-center justify-center hover:shadow-lg hover:shadow-black/30 transition-all duration-300",
    )}>
    {#if isOpen}
      <Icon carbon="X" size="sm" />
    {:else if icon}
      {@render icon?.()}
    {:else}
      <Icon carbon="MessageCircle" size="sm" />
    {/if}
  </Button>
</div>

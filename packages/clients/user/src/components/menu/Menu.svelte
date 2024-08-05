<script>
  import { writable } from 'svelte/store';
  import Button from "./Button.svelte"
  import IconRow from "./IconRow.svelte"
  import ColoredRectangle from "./Rect.svelte"

  // Menu state store
  const menuState = writable('closed');

  // Dummy icons
  const icons = [
    { color: 'bg-red-500' },
    { color: 'bg-green-500' },
    { color: 'bg-blue-500' }
  ];

  // Helper function to get menu height based on state
  function getMenuHeight(state) {
    switch (state) {
      case 'open':
        return 'h-3/5';
      case 'game':
        return 'h-52';
      case 'closed':
        return 'h-12';
      default:
        return 'h-12';
    }
  }

  // Toggle menu state
  function toggleMenu() {
    menuState.update(state => {
      if (state === 'closed') return 'game';
      if (state === 'game') return 'open';
      return 'closed';
    });
  }

</script>

<div class="fixed bottom-0 left-0 right-0 w-full bg-gray-200 transition-all duration-300 ease-in-out {getMenuHeight($menuState)}" on:click={toggleMenu}>
  <!-- Top row -->
  <div class="w-full h-12 bg-gray-300">
    <svelte:component this={IconRow} icons={$menuState === 'closed' ? [...icons, ...icons, ...icons] : icons} />
  </div>

  {#if $menuState !== 'closed'}
    <!-- Center content -->
    <div class="flex h-full">
      {#if $menuState === 'game'}
        <!-- Left column -->
        <div class="w-1/5 bg-gray-400">
          <svelte:component this={IconRow} icons={icons} />
        </div>
      {/if}

      <!-- Center column -->
      <div class="{$menuState === 'game' ? 'w-3/5' : 'w-full'} bg-gray-100 p-4">
        {#if $menuState === 'open'}
          <svelte:component this={Button} text="Button 1" color="bg-blue-500" />
          <svelte:component this={Button} text="Button 2" color="bg-green-500" />
          <svelte:component this={Button} text="Button 3" color="bg-red-500" />
          <svelte:component this={ColoredRectangle} color="bg-yellow-200" />
          <svelte:component this={ColoredRectangle} color="bg-pink-200" />
          <svelte:component this={ColoredRectangle} color="bg-purple-200" />
        {:else}
          <div class="flex justify-center items-center h-full">
            <span class="text-2xl font-bold">Game Content</span>
          </div>
        {/if}
      </div>

      {#if $menuState === 'game'}
        <!-- Right column -->
        <div class="w-1/5 bg-gray-400">
          <svelte:component this={IconRow} icons={icons} />
        </div>
      {/if}
    </div>

    <!-- Bottom row -->
    <div class="w-full h-12 bg-gray-300">
      <svelte:component this={IconRow} icons={$menuState === 'open' ? icons : []} />
    </div>
  {/if}
</div>

<script>

  import { writable } from 'svelte/store';
  import matrix from "$matrix"

  let signals = { navigation: [], surface : []}
  const menuState = writable('closed');

  let map;
  $: ({map} = matrix)

  $: {
    signals = { navigation: [], surface : []}
    for (const [signal] of $map) {
	if(["navigation"].includes(signal.type)) signals.navigation.push(signal)
	if(["surface"].includes(signal.type)) signals.surface.push(signal)
    }
    if(signals.surface.length > 0) menuState.set('open')
    else if(signals.navigation.length > 0) menuState.set('navigating')
    else menuState.set('closed')
  };

  function getMenuHeight(state) {
    switch (state) {
      case 'open':
        return 'h-3/5';
      case 'navigating':
        return 'h-52';
      case 'closed':
        return 'h-12';
      default:
        return 'h-12';
    }
  }

  const spacing = "4"
</script>


<div class={`fixed bottom-0 left-0 right-0 w-full bg-gray-200 transition-all duration-100 ease-in-out ${getMenuHeight($menuState)}`}>
<!--   <\!-- Top row -\-> -->
  <div class={`w-full h-12 bg-gray-300 px-${spacing}`}>
<!--     <\!-- top content -\-> -->
  </div>

  {#if $menuState !== 'closed'}
    <!-- Center content -->
    <div class={`flex h-full`}>
      {#if $menuState === 'navigating'}
        <!-- Left column -->
        <div class={`w-1/10 bg-gray-400 flex flex-col items-center p-${spacing}`}>
	    <!-- Left content -->
        </div>
      {/if}

      <!-- Center column -->
      <div class={`${$menuState === 'navigating' ? 'flex-grow' : 'w-full'} bg-gray-100 `}>
	{#if $menuState === 'open'}
	    <div class={`flex flex-col mx-auto p-${spacing} max-w-screen-sm items-start`}>
		{#each signals.surface as signal (signal.id)}
		    <svelte:component this={signal.component} {...signal} />
		{/each}
	    </div>
	{:else}
	    <div class={`flex justify-center items-center h-full`}>
		<!-- <span class="text-2xl font-bold">Navigation Content</span> -->
		{#each signals.navigation as signal (signal.id)}
		    <svelte:component this={signal.component} {...signal}/>
		{/each}
	    </div>
	{/if}
      </div>

      {#if $menuState === 'navigating'}
	    <!-- Right column -->
	    <div class={`w-1/10 bg-gray-400 flex flex-col items-center px-${spacing} py-${spacing}`}>
		    <!-- Right content -->
	    </div>
      {/if}
    </div>

  {/if}


  <!-- Bottom row -->
  {#if ['navigating', 'open'].includes($menuState)}
	<div class={`w-full h-12 bg-gray-300 px-${spacing}`}>
	    <!-- Bottom content -->
	</div>
  {/if}
</div>

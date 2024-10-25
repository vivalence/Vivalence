<script>
  import { onMount } from 'svelte';
  import ListItem from './ListItem.svelte';
  import trajectory from '$trajectory';

  export let trigger;
  export let active;
  export let options;
  export let label;

  let loading = true, activeItem;
  onMount(() => {
    if(typeof options === 'object' && options.length > 0) {
	activeItem = options[0]
      loading = false
    } else if(typeof options === 'object' && typeof options.then === 'function') {
      options.then((data) => {
	    options = data
	    activeItem = options[0]
	    loading = false
	})
    }
  });

  const handleHover = (item) => {
    activeItem = item;
  };

  const handleClick = (item,e) => {
    activeItem = item;
    selectItem(e);
  };

  const selectItem = (source = 'keyboard') => {
    trigger({ active: activeItem, source });
  };

  const moveDown = () => {
    const currentIndex = options.indexOf(activeItem);
    activeItem = options[(currentIndex + 1) % options.length];
  };

  const moveUp = () => {
    const currentIndex = options.indexOf(activeItem);
    activeItem = options[(currentIndex - 1 + options.length) % options.length];
  };

  onMount(() => {
    trajectory.use((m) => {
      m.set(m.signals.keyboard.j, moveDown);
      m.set(m.signals.keyboard.k, moveUp);
      m.set(m.signals.keyboard.l, selectItem);
      m.set(m.signals.keyboard.ArrowDown, moveDown);
      m.set(m.signals.keyboard.ArrowUp, moveUp);
      m.set(m.signals.keyboard.Enter, selectItem);
    });
  });

</script>

{#if loading}
  <div>Loading...</div>
{:else}
  <div class="mb-2">{label}</div>

  <ul class="menu bg-base-200 rounded-box min-w-80">
    {#each options as option, index }
	<ListItem
	    item={option}
	    index={index}
	    isActive={option.id === activeItem.id}
	    onHover={handleHover}
	    onClick={handleClick}
	/>
    {/each}
  </ul>
{/if}

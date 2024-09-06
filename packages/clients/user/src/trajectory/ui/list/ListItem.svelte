<script>
  export let item;
  export let isActive = false;
  export let onHover;
  export let onClick;
  export let index;

  let baseClass, activeClass, alternateClass;
  $: {
    baseClass = 'cursor-pointer';
    activeClass = isActive ? 'bg-base-content text-base-200 hover:text-gray-100' : '';
    alternateClass = !isActive && (index % 2 === 1 ? 'bg-base-300 text-' : '' );
  }
</script>

<li
    class={`${baseClass}`}
    on:mouseover={() => onHover(item)}
    on:click={(e) => onClick(item, e)}>

    <a class={` ${activeClass}   ${alternateClass}`}>
	{item.label}
    </a>
</li>






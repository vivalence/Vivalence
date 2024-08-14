<script>
  export let item;
  export let isActive = false;
  export let onHover;
  export let onClick;
  export let index;

  let baseClass, activeClass, alternateClass;
  $: {
    baseClass = ' w-full cursor-pointer';
    activeClass = isActive ? 'bg-black text-white' : '';
    alternateClass = !isActive && (index % 2 === 0 ? 'bg-gray-200 text-black' : 'bg-gray-50' );
  }
</script>

<li
    class={`${baseClass} ${activeClass} ${alternateClass}`}
    on:mouseover={() => onHover(item)}
    on:click={(e) => onClick(item, e)} >
    {item.label}
</li>






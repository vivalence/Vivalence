<script>
    export let direction = "row"; // default to flex-row
    export let wrap = "nowrap"; // default to flex-nowrap
    export let justify = "start"; // default to justify-start
    export let items = "start"; // default to items-start
    // export let gap = ""; // no default gap
    export let classes = "";

    let computedClasses;
    $: {
        computedClasses = `flex flex-${direction} flex-${wrap}`;
        computedClasses += ` justify-${justify} items-${items}`;
    }
</script>

<div class={`${computedClasses} ${classes}`}>
    <slot />
</div>

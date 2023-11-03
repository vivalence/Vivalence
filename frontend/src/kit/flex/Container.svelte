<script>
    export let direction = "row"; // default to flex-row
    export let wrap = "nowrap"; // default to flex-nowrap
    export let justifyContent = "start"; // default to justify-start
    export let alignItems = "start"; // default to items-start
    export let gap = ""; // no default gap
    export let classes = "";

    let computedClasses;
    $: {
        computedClasses = `flex flex-${direction} flex-${wrap}`;
        computedClasses += ` justify-${justifyContent} items-${alignItems}`;
    }
</script>

<div class={`${computedClasses} ${classes}`}>
    <slot />
</div>

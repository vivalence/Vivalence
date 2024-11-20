<script>
    export let columns = ""; // No default columns
    export let rows = ""; // No default rows
    export let gap = ""; // No default gap
    export let justifyItems = "stretch"; // Default to stretch
    export let justifyContent = "start"; // Default to start
    export let alignItems = "stretch"; // Default to stretch
    export let alignContent = "start"; // Default to start
    export let classes = "";

    let computedClasses;
    $: {
        computedClasses = `grid justify-items-${justifyItems} justify-content-${justifyContent} items-${alignItems} align-content-${alignContent}`;
        computedClasses += gap ? ` gap-${gap}` : "";
        computedClasses += columns ? ` grid-cols-${columns}` : "";
        computedClasses += rows ? ` grid-rows-${rows}` : "";
    }
</script>

<div class={`${computedClasses} ${classes}`}>
    <slot />
</div>

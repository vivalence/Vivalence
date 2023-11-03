<script>
    export let colSpan = ""; // No default colSpan
    export let rowSpan = ""; // No default rowSpan
    export let justifySelf = "auto"; // Default to auto
    export let alignSelf = "auto"; // Default to auto
    export let classes = "";

    let computedClasses;
    $: {
        computedClasses = `justify-self-${justifySelf} align-self-${alignSelf}`;
        computedClasses += colSpan ? ` col-span-${colSpan}` : "";
        computedClasses += rowSpan ? ` row-span-${rowSpan}` : "";
    }
</script>

<div class={`${computedClasses} ${classes}`}>
    <slot />
</div>

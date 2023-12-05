<script>
    export let grow = undefined // empty means use the default flex-grow behavior
    export let shrink = ""; // empty means use the default flex-shrink behavior
    export let basis = "auto"; // default to flex-auto
    export let order = ""; // no default order
    export let alignSelf = ""; // no default for align-self, Tailwind doesn't provide this by default
    export let classes = "";

    let computedClasses;
    $: {
        computedClasses = ``;
        computedClasses += grow !== undefined && grow !== "0" ? ` grow` : "";
        computedClasses += shrink ? ` shrink-${shrink}` : "";
        computedClasses += basis ? ` basis-${basis}` : "";
        computedClasses += order ? ` order-${order}` : "";
        computedClasses += alignSelf ? ` self-${alignSelf}` : "";
    }
</script>

<div class={`${computedClasses} ${classes}`}>
    <slot />
</div>

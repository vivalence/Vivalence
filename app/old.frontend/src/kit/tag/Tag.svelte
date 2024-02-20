<!-- Tag.svelte -->
<script>
    import Text from "../text/Text.svelte"; // your existing Text component
    export let size = "md"; // 'xs', 'sm', 'md', 'lg', 'xl'
    export let variant = "dark"; // dark light info success warning danger

    let borderSize;
    switch (size) {
        case "xs":
            borderSize = "border";
            break;
        case "sm":
            borderSize = "border";
            break;
        case "md":
            borderSize = "border";
            break;
        case "lg":
            borderSize = "border-2";
            break;
        case "xl":
            borderSize = "border-4";
            break;
    }
    let color;
    switch (variant) {
        case "info":
            color = "system-info-2";
            break;
        case "success":
            color = "system-success-2";
            break;
        case "warning":
            color = "system-warning-2";
            break;
        case "danger":
            color = "system-danger-2";
            break;
        case "dark":
            color = "theme-text-4";
            break;
    }
</script>

<span class={`px-2 py-1 mr-1 inline-flex rounded-full ${borderSize} border-${color}`}>
    <Text classes={`mt-[2px]`} {size} {color}>
        <slot />
    </Text>
</span>

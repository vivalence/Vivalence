<script>
    export let iconAlt = "";
    export let icon = "";
    export let hierarchy = "primary";
    export let outlined = false;
    export let state = "default";
    export let size = "md";
    export let classes = "";

    // const getSvgPath = (iconName) => `../../../static/icons/${iconName}`;

    let hierarchyClass;
    switch (hierarchy) {
        case "accent":
            hierarchyClass = "text-accent";
            break;
        case "primary":
            hierarchyClass = "text-primary";
            break;
        case "secondary":
            hierarchyClass = "text-secondary";
            break;
        case "destructive":
            hierarchyClass = "text-destructive";
            break;
        default:
            hierarchyClass = "text-primary"; // default if none match
            break;
    }

    let sizeClass;
    switch (size) {
        case "sm":
            sizeClass = "w-4 h-4";
            break;
        case "md":
            sizeClass = "w-6 h-6";
            break;
        case "lg":
            sizeClass = "w-8 h-8";
            break;
        case "xl":
            sizeClass = "w-12 h-12";
            break;
        default:
            sizeClass = "w-6 h-6"; // default if none match
            break;
    }

    let stateClass = state === "disabled" ? "opacity-50 cursor-not-allowed" : "opacity-100";
    let outlinedClass = outlined ? "ring-2 ring-inset" : "";

    const iconClasses = `
    ${hierarchyClass}
    ${sizeClass}
    ${stateClass}
    ${outlinedClass} 
    ${classes}
  `.trim();
</script>

<img src={icon} class={iconClasses} alt={iconAlt } />

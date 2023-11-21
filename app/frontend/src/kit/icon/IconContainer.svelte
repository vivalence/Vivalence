<script>
    export let size = "md"; // default size
    export let hierarchy = "primary"; // default hierarchy
    export let bordered = false;
    export let classes = "";

    let widthHeightClass;
    let paddingClass;

    $: switch (size) {
        case "sm":
            widthHeightClass = "w-8 h-8";
            paddingClass = "p-1";
            break;
        case "md":
            widthHeightClass = "w-16 h-16";
            paddingClass = "p-2";
            break;
        case "lg":
            widthHeightClass = "w-24 h-24";
            paddingClass = "p-4";
            break;
        case "xl":
            widthHeightClass = "w-32 h-32";
            paddingClass = "p-6";
            break;
        default:
            widthHeightClass = "w-16 h-16";
            paddingClass = "p-2";
            break;
    }

    let backgroundClass;
    let borderClass;

    $: switch (hierarchy) {
        // case "accent":
        //     backgroundClass = "bg-theme-accent";
        //     borderClass = "text-on-accent";
        //     break;
        case "primary":
            // backgroundClass = "bg-theme-primary";
            backgroundClass = "bg-theme-ui-6";
            borderClass = "border-theme-border-2";
            break;
        // case "secondary":
        //     backgroundClass = "bg-theme-secondary";
        //     borderClass = "text-on-secondary";
        //     break;
        // case "destructive":
        //     backgroundClass = "bg-destructive";
        //     borderClass = "text-on-destructive";
        //     break;
        // default:
        //     backgroundClass = "bg-theme-ui-6";
        //     borderClass = "border-theme-border-1";
        //     break;
    }

    const roundedClass = "rounded-lg";
    $: if (bordered) {
        borderClass += ` border-2 `;
    }

    let computedClasses;
    $: computedClasses = `
    ${widthHeightClass}
    ${paddingClass}
    ${backgroundClass}
    ${borderClass}
    ${roundedClass}
    flex items-center justify-center`;
</script>

<div class={computedClasses}>
    <slot />
</div>

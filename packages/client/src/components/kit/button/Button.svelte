<script>
    import { createEventDispatcher } from "svelte";
    import Text from "../text/Text.svelte";

    export let state = "default";
    export let hierarchy = "primary";
    export let size = "md";
    export let outlined = false;
    export let icon = false;
    export let iconClass = "";
    export let IconComponent = undefined;

    const dispatch = createEventDispatcher();
    const handleClick = () => dispatch("click");

    let bgColor,
        textColor,
        borderColor,
        padding,
        borderStyles,
        hoverColor,
        focusColor,
        rounded,
        iconSize;

    $: {
        switch (hierarchy) {
            case "accent":
                bgColor = !outlined ? "bg-theme-accent" : "bg-transparent";
                textColor = !outlined ? "text-theme-text-contrast" : "text-theme-accent";
                borderColor = "border-theme-accent";
                hoverColor = `hover:bg-interactive-hover-accent hover:border-interactive-hover-accent`;
                focusColor =
                    "focus:bg-interactive-focus-accent focus:border-interactive-focus-accent";
                break;

            case "primary":
                bgColor = !outlined ? `bg-theme-primary` : "bg-transparent";
                textColor = !outlined ? "text-theme-text-inverse" : "text-theme-text-inverse";
                borderColor = "border-theme-border-1 ";
                hoverColor = "hover:bg-interactive-hover-primary";
                focusColor = "focus:bg-interactive-focus-primary";
                break;

            case "secondary":
                bgColor = !outlined ? "bg-theme-secondary" : "bg-transparent";
                textColor = !outlined ? "text-theme-text-1" : "text-theme-text-1";
                borderColor = "border-theme-border-2";
                hoverColor = `hover:bg-interactive-hover-secondary`;
                focusColor = "focus:bg-interactive-focus-secondary";
                break;

            case "destructive":
                bgColor = !outlined ? "bg-system-danger-2" : "bg-transparent";
                textColor = !outlined ? "text-system-danger-2" : "text-system-danger-2";
                borderColor = "border-system-danger-2";
                hoverColor = `hover:bg-palette-red-50`;
                focusColor = "focus:bg-palette-red-50";
                break;
        }

        switch (state) {
            case "skeleton":
                bgColor = "bg-interactive-skeleton-1";
                textColor = "text-theme-text-1";
                break;
            case "pending":
                // Handle pending state if necessary
                break;
            case "disabled":
                bgColor = "bg-interactive-disabled-1";
                textColor = "text-interactive-disabled-2";
                hoverColor = "";
                focusColor = "";

                break;
            default:
                break;
        }

        switch (size) {
            case "sm":
                padding = "px-2 py-1";
                if (icon === true) {
                    padding = "p-1";
                    iconSize = 16;
                }
                break;
            case "md":
                padding = "px-4 py-1";
                if (icon === true) {
                    padding = "p-2";
                    iconSize = 24;
                }
                break;
            case "lg":
                padding = "px-4 py-2";
                if (icon === true) {
                    padding = "p-3";
                    iconSize = 32;
                }
                break;
            case "xl":
                padding = "px-5 py-2";
                if (icon === true) {
                    padding = "p-4";
                    iconSize = 40;
                }
                break;
        }
        rounded = icon !== true ? "rounded-xl" : "rounded-full";
        borderStyles = outlined ? `${borderColor} border` : `${borderColor} border`;
    }
</script>

<button
    on:click={handleClick}
    class={`${bgColor} ${textColor} ${borderStyles} ${hoverColor} ${focusColor} ${padding} font-medium ${rounded} focus:outline-none`}
>
    {#if icon === "leading"}
        <svelte:component this={IconComponent} size={iconSize} class={iconClass} />
    {/if}
    {#if icon === true}
        <svelte:component this={IconComponent} size={iconSize} class={iconClass} />
    {:else}
        <Text {size} color="inherit" weight="medium" elementType="span"><slot /></Text>
    {/if}

    {icon === "trailing" ? iconComponent : ""}
</button>

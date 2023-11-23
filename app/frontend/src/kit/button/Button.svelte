<script>
    import { createEventDispatcher } from "svelte";
    import Text from "../text/Text.svelte";

    export let state = "default";
    export let hierarchy = "primary";
    export let size = "md";
    export let iconComponent = undefined;
    export let outlined = false;
    export let icon = false;

    const dispatch = createEventDispatcher();
    const handleClick = () => dispatch("click");

    let bgColor, textColor, borderColor, padding, borderStyles, hoverColor, focusColor;

    $: {
        switch (hierarchy) {
            case "accent":
                bgColor = !outlined ? "bg-theme-accent" : "bg-transparent";
                textColor = !outlined ? "text-theme-text-contrast" : "text-theme-accent";
                borderColor = "border-theme-accent";
                hoverColor = `hover:bg-interactive-hover-accent hover:border-interactive-hover-accent`;
                focusColor = "focus:bg-interactive-focus-accent focus:border-interactive-focus-accent";
                break;

            case "primary":
                bgColor = `bg-theme-primary`;
                textColor = "text-theme-text-inverse";
                borderColor = "border-theme-border-1";
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
                bgColor = outlined ? "bg-transparent" : "bg-theme-danger-1";
                textColor = outlined ? "text-theme-danger-1" : "text-theme-text-1";
                borderColor = "border-theme-danger-1";
                hoverColor = `hover:bg-interactive-focus-danger`;
                focusColor = "focus:bg-interactive-focus-danger";
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
                break;
            case "md":
                padding = "px-4 py-1";
                break;
            case "lg":
                padding = "px-4 py-2";
                break;
            case "xl":
                padding = "px-5 py-2";
                break;
        }

        borderStyles = outlined ? `${borderColor} border` : `${borderColor} border`;
    }
</script>

<button
    on:click={handleClick}
    class={`${bgColor} ${textColor} ${borderStyles} ${hoverColor} ${focusColor} ${padding} font-medium rounded-xl focus:outline-none`}
>
    {icon === "leading" ? iconComponent : ""}
    {#if icon === true}
        {iconComponent}
    {:else}
        <Text {size} color="inherit" weight="medium" elementType="span"><slot /></Text>
    {/if}

    {icon === "trailing" ? iconComponent : ""}
</button>

<script>
    export let variant = "text"; // 'heading', 'text', 'code'
    export let weight = "regular"; // thin 'regular', 'light', 'medium', 'heavy'
    export let size = "md"; // 'xs', 'sm', 'md', 'lg', 'xl'
    export let color = "theme-text-1"; // "link", "text-1", "text-2", "placeholder", "contrast", "hint", "disabled", "error", "inverse"
    export let as = undefined; // 'h1', 'h2', 'h3', 'p', 'span'
    export let elementType = "p"; // 'h1', 'h2', 'h3', 'p', 'span'
    export let serif = false;
    export let italic = false;
    export let classes = "";

    // Computed values
    let computedClass = "";
    $: {
        // Font Family
        switch (variant) {
            case "text":
                computedClass = serif ? "font-serif-text" : "font-sans-text";
                break;
            case "heading":
                computedClass = serif ? "font-serif-heading" : "font-sans-heading";
                break;
            case "code":
                computedClass = "font-code";
                break;
        }

        // Font Weight
        switch (weight) {
            case "regular":
                computedClass += " font-regular";
                break;
            case "thin":
                computedClass += " font-thin";
                break;
            case "light":
                computedClass += " font-light";
                break;
            case "medium":
                computedClass += " font-medium";
                break;
            case "heavy":
                computedClass += " font-bold";
                break;
        }

        // Font Size
        // switch (size) {case "xs": computedClass += " text-xs"; break; case "sm": computedClass += " text-sm"; break; case "md": computedClass += " text-base"; break; case "lg": computedClass += " text-lg"; break; case "xl": computedClass += " text-xl"; break;}
        computedClass += ` text-${size}`;

        // Font Color
        computedClass += ` text-${color}`;

        // Emphasis
        if (italic) {
            computedClass += " italic";
        }
    }
</script>

<svelte:element this={as || elementType} class="{computedClass} {classes}">
    <slot />
</svelte:element>

<!-- <Text variant="heading" serif={true} weight="heavy" class="text-xl text-red-500"> -->
<!--   This is a heavy-weight heading in Serif. -->
<!-- </Text> -->

<!-- InputComponent.svelte -->
<script>
    import Information from "carbon-icons-svelte/lib/Information.svelte";
    import Text from "../text/Text.svelte";

    export let value = "";
    export let onValue;

    export let containerClasses = "";
    export let theme = "dark";
    export let placeholder = "";
    export let label = "";
    export let tooltip = "";

    let visible = false;

    const themeClasses = {
        dark: `bg-theme-field-1 text-theme-text-1 border-theme-border-2 focus:border-interactive-focus-secondary focus-visible:border-interactive-focus-secondary`
    };
    const positioning = `pb-2 pt-3 px-4 ${tooltip ? "pr-12" : ""} flex items-center w-full`;
    const fontClasses = "font-regular font-sans-text text-lg";

    function handleInput(event) {
        onValue(event.target.value);
    }
</script>

{#if label}
    <Text as="span" size="md">
        {label}
    </Text>
{/if}

<div class={`relative w-full flex items-center ${containerClasses}`}>
    <input
        class={`border rounded-lg ${positioning} ${fontClasses} ${themeClasses[theme]}`}
        bind:value
        on:input={handleInput}
        type="text"
        {placeholder}
    />
    {#if tooltip}
        <div
            class="absolute group cursor-pointer right-4 flex align-center"
            on:mouseenter={() => (visible = true)}
            on:mouseleave={() => (visible = false)}
        >
            >
            <Information
                class="h-6 w-6 text-theme-icon-2 color-theme-icon-2 hover:theme-contrast current-color"
            />

            <div
                class="absolute left-full ml-2 mb-2 text-sm rounded-xl p-3 bg-theme-ui-6 border border-theme-border-2"
                class:hidden={!visible}
                class:opacity-100={visible}
                class:opacity-0={!visible}
            >
                <Text as="span" size="sm">
                    {tooltip}
                </Text>
            </div>
        </div>
    {/if}
</div>

<!-- <div class="relative group"> -->
<!--     <Information -->
<!--         class="h-6 w-6 text-theme-icon-2 color-theme-icon-2 hover:theme-contrast current-color cursor-pointer right-4 absolute " -->
<!--     /> -->

<!--     <span -->
<!--         class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100" -->
<!--     > -->
<!--         {tooltip} -->
<!--     </span> -->
<!-- </div> -->

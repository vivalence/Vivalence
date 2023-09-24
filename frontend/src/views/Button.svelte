<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let label = "Button";
    export let variant = "primary"; // primary, secondary, etc.
    export let disabled = false;

    function handleClick() {
        if (!disabled) {
            dispatch("click");
        }
    }
</script>

<button
    on:click={handleClick}
    class={`btn btn-${variant} ${disabled ? "btn-disabled" : ""}  w-32 `}
    aria-label={label}
    {disabled}
>
    <slot />
</button>

<style>
    .btn {
        @apply p-2 rounded text-white;
    }
    .btn-primary {
        @apply bg-blue-500;
    }
    .btn-primary:hover {
        @apply bg-blue-600;
    }
    .btn-secondary {
        @apply bg-gray-500;
    }

    .btn-secondary:hover {
        @apply bg-gray-600;
    }

    .btn-disabled {
        @apply bg-gray-300 cursor-not-allowed;
    }
</style>

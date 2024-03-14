<script>
    export let classes = '';
    export let borderColor = "border-theme-border-1";
</script>

<div class={`rounded-xl border ${classes} ${borderColor} shadow-md w-80`}>
    <slot />
</div>

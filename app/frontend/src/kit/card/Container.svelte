<script>
    // import CardApp from "./CardApp.svelte";
    // export let variant = "default";
    // export let ...additionalProps;
    // console.log('additionalProps', additionalProps)

    // let component;
    // $: {
    //     switch (variant) {
    //         case "app":
    //             component = CardApp;
    //             break;
    //         default:
    //             component = null;
    //     }
    // }

</script>

<div class="bg-theme-contrast rounded shadow-md w-80">
  <slot/>
</div>
